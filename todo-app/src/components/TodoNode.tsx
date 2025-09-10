import React, { useState, useCallback, memo } from "react";
import type { JSX } from "react";
import type { TodoItemType } from "../types/TodoItemType";
import { TodoStatus, TodoItemDispatchType } from "../types/TodoItemType";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import { formattedEndDate } from "../utils/DateUtils";

type ChildRowProps = {
  child: TodoItemType;
  editingChildId: string | null;
  editingText: string;
  onStartEdit: (id: string) => void;
  onChangeEdit: (v: string) => void;
  onFinishEdit: (id: string) => void;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
};

const ChildRow = memo(function ChildRow({
  child,
  editingChildId,
  editingText,
  onStartEdit,
  onChangeEdit,
  onFinishEdit,
  onToggleDone,
  onDelete,
}: ChildRowProps): JSX.Element {
  const isEditing = editingChildId === child.Id;
  return (
    <li key={child.Id} className="todo-child">
      <span className="child-badge">↳</span>

      {isEditing ? (
        <input
          autoFocus
          className="number-input"
          value={editingText}
          onChange={(e) => onChangeEdit(e.target.value)}
          onBlur={() => onFinishEdit(child.Id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onFinishEdit(child.Id);
          }}
          placeholder="Child todo text..."
        />
      ) : (
        <>
          <input
            className="done-checkbox"
            aria-label={child.Status === TodoStatus.Done ? "Mark child as not done" : "Mark child as done"}
            type="checkbox"
            checked={child.Status === TodoStatus.Done}
            onChange={() => onToggleDone(child.Id)}
          />
          <span className={`child-text ${child.Status === TodoStatus.Done ? "todo-done" : ""}`}>{child.Text}</span>
        </>
      )}

      {child.EndsAt ? <span className="todo-end-date">{formattedEndDate(child.EndsAt)}</span> : null}

      <div style={{ marginLeft: "auto" }}>
        <button className="delete-btn" onClick={() => onDelete(child.Id)} title="Delete child">Delete</button>
      </div>
    </li>
  );
});

function TodoNode({
  node,
  selectedIds = [],
  onToggle,
}: {
  node: TodoItemType & { children?: TodoItemType[] };
  selectedIds?: string[];
  onToggle?: (id: string) => void;
}): JSX.Element {
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const checked = selectedIds?.includes(node.Id) ?? false;
  const todos = useTodos() ?? [];
  const dispatch = useTodosDispatch();

  const isDone = node.Status === TodoStatus.Done;

  const handleDelete = useCallback((id: string) => {
    if (!dispatch) return;
    dispatch({ type: TodoItemDispatchType.deleted, todo: { Id: id } as any });
  }, [dispatch]);

  const setStatus = useCallback((id: string, status: TodoStatus) => {
    if (!dispatch) return;
    const orig = todos.find((t) => t.Id === id);
    if (!orig) {
      dispatch({ type: TodoItemDispatchType.changed, todo: { Id: id, Status: status } as any });
      return;
    }
    const updated = { ...orig, Status: status } as TodoItemType;
    dispatch({ type: TodoItemDispatchType.changed, todo: updated });
  }, [dispatch, todos]);

  const toggleDoneParent = useCallback(() => {
    const willBeDone = node.Status !== TodoStatus.Done;
    setStatus(node.Id, willBeDone ? TodoStatus.Done : TodoStatus.New);
    (todos || []).forEach((t) => {
      if (t.ParentId === node.Id) setStatus(t.Id, willBeDone ? TodoStatus.Done : TodoStatus.New);
    });
  }, [node.Id, node.Status, setStatus, todos]);

  const handleAddChild = useCallback(() => {
    if (!dispatch) return;
    const newId = crypto.randomUUID();
    const newTodo: TodoItemType = {
      Id: newId,
      Text: "",
      Status: TodoStatus.New,
      ParentId: node.Id,
    };
    dispatch({ type: TodoItemDispatchType.added, todo: newTodo });
    setEditingChildId(newId);
    setEditingText("");
  }, [dispatch, node.Id]);

  const finishEditingChild = useCallback((childId: string) => {
    if (!dispatch) return;
    const orig = todos.find((t) => t.Id === childId);
    if (!orig) return;
    const text = editingText.trim();
    const updated: TodoItemType = { ...orig, Text: text || orig.Text };
    dispatch({ type: TodoItemDispatchType.changed, todo: updated });
    setEditingChildId(null);
    setEditingText("");
  }, [dispatch, todos, editingText]);

  const onStartEdit = useCallback((id: string) => {
    setEditingChildId(id);
    setEditingText("");
  }, []);
  const onChangeEdit = useCallback((v: string) => setEditingText(v), []);
  const onFinishEdit = finishEditingChild;
  const onToggleDone = useCallback((id: string) => {
    const c = todos.find((t) => t.Id === id);
    if (!c) return;
    setStatus(id, c.Status === TodoStatus.Done ? TodoStatus.New : TodoStatus.Done);
  }, [todos, setStatus]);
  const onDelete = handleDelete;

  return (
    <li className="todo-node">
      <div className="todo-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {onToggle ? (
          <input className="select-checkbox" type="checkbox" checked={checked} onChange={() => onToggle?.(node.Id)} />
        ) : null}

        <input
          className="done-checkbox"
          aria-label={isDone ? "Mark as not done" : "Mark as done"}
          type="checkbox"
          checked={isDone}
          onChange={toggleDoneParent}
        />

        <span className={`todo-text ${isDone ? "todo-done" : ""}`}>{node.Text}</span>
        {node.EndsAt ? <span className="todo-end-date">{formattedEndDate(node.EndsAt)}</span> : null}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn" onClick={handleAddChild}>Add</button>
          <button className="delete-btn" onClick={() => handleDelete(node.Id)} title="Delete">Delete</button>
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <ul className="todo-children">
          {node.children.map((c) => (
            <ChildRow
              key={c.Id}
              child={c}
              editingChildId={editingChildId}
              editingText={editingText}
              onStartEdit={onStartEdit}
              onChangeEdit={onChangeEdit}
              onFinishEdit={onFinishEdit}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default memo(TodoNode);