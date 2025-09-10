import { useState, useCallback, memo, type JSX } from "react";
import type { TodoItemType } from "../types/TodoItemType";
import { TodoStatus, TodoItemDispatchType } from "../types/TodoItemType";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import { formattedEndDate } from "../utils/DateUtils";

type ChildRowProps = {
  child: TodoItemType;
  editingChildId: string | null;
  editingText: string;
  onChangeEdit: (v: string) => void;
  onFinishEdit: (id: string) => void;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
};

const ChildRow = memo(function ChildRow({
  child,
  editingChildId,
  editingText,
  onChangeEdit,
  onFinishEdit,
  onToggleDone,
  onDelete,
  onDragStart,
}: ChildRowProps): JSX.Element {
  const isEditing = editingChildId === child.Id;

  return (
    <li className="todo-child" draggable onDragStart={(e) => onDragStart(e, child.Id)}>
      <div className="todo-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span className="child-badge">↳</span>

        {isEditing ? (
          <input
            autoFocus
            className="inline-input"
            value={editingText}
            onChange={(e) => onChangeEdit(e.target.value)}
            onBlur={() => onFinishEdit(child.Id)}
            onKeyDown={(e) => { if (e.key === "Enter") onFinishEdit(child.Id); }}
            placeholder="Child todo..."
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

            {child.EndsAt ? <span className="todo-end-date">{formattedEndDate(child.EndsAt)}</span> : null}
          </>
        )}

        <div style={{ marginLeft: "auto" }}>
          <button className="delete-btn" onClick={() => onDelete(child.Id)} title="Delete child">Delete</button>
        </div>
      </div>
    </li>
  );
});

function TodoNode({ node }: { node: TodoItemType & { children?: TodoItemType[] } }): JSX.Element {
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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
    const updated = orig ? { ...orig, Status: status } : ({ Id: id, Status: status } as any);
    dispatch({ type: TodoItemDispatchType.changed, todo: updated as any });
  }, [dispatch, todos]);

  const toggleDoneParent = useCallback(() => {
    const willBeDone = node.Status !== TodoStatus.Done;
    setStatus(node.Id, willBeDone ? TodoStatus.Done : TodoStatus.New);
    todos.forEach((t) => { if (t.ParentId === node.Id) setStatus(t.Id, willBeDone ? TodoStatus.Done : TodoStatus.New); });
  }, [node.Id, node.Status, setStatus, todos]);

  const handleAddChild = useCallback(() => {
    if (!dispatch) return;
    const newId = crypto.randomUUID();
    const newTodo: TodoItemType = { Id: newId, Text: "", Status: TodoStatus.New, ParentId: node.Id };
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

  const onChangeEdit = useCallback((v: string) => setEditingText(v), []);
  const onToggleDone = useCallback((id: string) => {
    const c = todos.find((t) => t.Id === id); if (!c) return; setStatus(id, c.Status === TodoStatus.Done ? TodoStatus.New : TodoStatus.Done);
  }, [todos, setStatus]);

  const onDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("dragging");
  }, []);

  const onDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("dragging");
    setIsDragOver(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); e.dataTransfer.dropEffect = "move"; }, []);
  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain"); if (!draggedId || draggedId === node.Id) return;

    // avoid cycles
    let p = node.ParentId; while (p) { if (p === draggedId) return; const parent = todos.find((t) => t.Id === p); p = parent?.ParentId; }

    const orig = todos.find((t) => t.Id === draggedId); if (!orig || !dispatch) return;
    dispatch({ type: TodoItemDispatchType.changed, todo: { ...orig, ParentId: node.Id } as any });

    // detach direct children of dragged item to keep one-level depth
    todos.forEach((t) => { if (t.ParentId === draggedId) dispatch({ type: TodoItemDispatchType.changed, todo: { ...t, ParentId: undefined } as any }); });
  }, [node.Id, node.ParentId, todos, dispatch]);

  return (
    <li
      className={`todo-node ${isDragOver ? "drag-over" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, node.Id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="todo-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input className="done-checkbox" aria-label={isDone ? "Mark as not done" : "Mark as done"} type="checkbox" checked={isDone} onChange={toggleDoneParent} />

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
              onChangeEdit={onChangeEdit}
              onFinishEdit={finishEditingChild}
              onToggleDone={onToggleDone}
              onDelete={handleDelete}
              onDragStart={onDragStart}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default memo(TodoNode);