import type { JSX } from "react";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import type { TodoItemType } from "../types/TodoItemType";
import { TodoItemDispatchType, TodoStatus } from "../types/TodoItemType";
import { formattedEndDate } from "../utils/DateUtils";

export default function TodoTable(): JSX.Element {
  const todos = useTodos() ?? [];
  const dispatch = useTodosDispatch();

  const handleToggle = (todo: TodoItemType) => {
    if (!dispatch) return;
    const updated: TodoItemType = { ...todo, Status: todo.Status === TodoStatus.Done ? TodoStatus.New : TodoStatus.Done };
    dispatch({ type: TodoItemDispatchType.changed, todo: updated });
  };

  const handleDelete = (id?: string) => {
    if (!dispatch || !id) return;
    dispatch({ type: TodoItemDispatchType.deleted, todo: { Id: id } as any });
  };

  // show parent then children as rows
  const rows: TodoItemType[] = [];
  todos.forEach((t) => {
    if (!t.ParentId) {
      rows.push(t);
      todos.forEach((c) => { if (c.ParentId === t.Id) rows.push(c); });
    }
  });

  return (
    <table className="todo-table" role="grid" aria-label="Todos">
      <tbody>
        {rows.map((r) => (
          <tr key={r.Id} className={r.ParentId ? "child-row" : undefined}>
            <td><span className={`todo-text ${r.Status === TodoStatus.Done ? "todo-done" : ""}`}>{r.Text}</span></td>
            <td>
              <input className="done-checkbox" type="checkbox" checked={r.Status === TodoStatus.Done} onChange={() => handleToggle(r)} />
            </td>
            <td>{r.EndsAt ? formattedEndDate(r.EndsAt) : "—"}</td>
            <td>
              <button className="delete-btn" onClick={() => handleDelete(r.Id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
