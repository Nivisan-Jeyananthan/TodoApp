import { useMemo, useState, useCallback } from "react";
import type { JSX } from "react";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import { TodoItemType, TodoItemDispatchType } from "../types/TodoItemType";
import { buildTodoTree } from "../utils/TodoTree";
import TodoNode from "./TodoNode";

export default function TodoList(): JSX.Element {
  const todos = useTodos() ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedParent, setSelectedParent] = useState<string | "">("");
  const dispatch = useTodosDispatch();

  const idToTodo = useMemo(() => {
    const m = new Map<string, TodoItemType>();
    (todos || []).forEach((t) => m.set(t.Id, t));
    return m;
  }, [todos]);

  // map parentId -> [childIds]
  const childrenMap = useMemo(() => {
    const m = new Map<string, string[]>();
    (todos || []).forEach((t) => {
      if (t.ParentId) {
        const arr = m.get(t.ParentId) ?? [];
        arr.push(t.Id);
        m.set(t.ParentId, arr);
      }
    });
    return m;
  }, [todos]);

  const descendantsOf = useCallback((ids: string[]) => {
    const out = new Set<string>();
    const stack = [...ids];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (out.has(cur)) continue;
      out.add(cur);
      const children = childrenMap.get(cur) || [];
      children.forEach((c) => {
        if (!out.has(c)) stack.push(c);
      });
    }
    return out;
  }, [childrenMap]);

  const descendantsSet = useMemo(() => descendantsOf(selectedIds), [selectedIds, descendantsOf]);

  const availableParents = useMemo(() => {
    return (todos || []).filter((t) => !t.ParentId && !selectedIds.includes(t.Id) && !descendantsSet.has(t.Id));
  }, [todos, selectedIds, descendantsSet]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleGroup = useCallback(() => {
    if (!dispatch) return;
    const parentId = selectedParent || undefined;

    selectedIds.forEach((id) => {
      const orig = idToTodo.get(id);
      if (!orig) return;
      const updated: TodoItemType = { ...orig, ParentId: parentId };
      dispatch({ type: TodoItemDispatchType.changed, todo: updated });
    });

    selectedIds.forEach((movedId) => {
      const directChildren = childrenMap.get(movedId) || [];
      directChildren.forEach((childId) => {
        const child = idToTodo.get(childId);
        if (!child) return;
        const childUpdated: TodoItemType = { ...child, ParentId: undefined };
        dispatch({ type: TodoItemDispatchType.changed, todo: childUpdated });
      });
    });

    setSelectedIds([]);
    setSelectedParent("");
  }, [dispatch, selectedIds, selectedParent, idToTodo, childrenMap]);

  const roots = useMemo(() => buildTodoTree(todos || []), [todos]);
  return (
    <div>
      <div className="group-bar">
        {selectedIds.length > 0 ? (
          <div className="group-controls">
            <label className="group-label">
              Parent
              <select value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
                <option value="">-- none --</option>
                {availableParents.map((p) => (
                  <option key={p.Id} value={p.Id}>
                    {p.Text}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn primary" onClick={handleGroup}>Group</button>
            <button className="btn" onClick={() => setSelectedIds([])}>Cancel</button>
          </div>
        ) : (
          <div className="group-hint">Select items to group them under a parent</div>
        )}
      </div>

      <ul className="todo-root-list">
        {roots.map((t) => (
          <TodoNode key={t.Id} node={t} selectedIds={selectedIds} onToggle={toggleSelected} />
        ))}
      </ul>
    </div>
  );
}