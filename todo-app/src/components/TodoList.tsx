import { useMemo, useState, useEffect } from "react";
import type { JSX } from "react";
import { useTodos } from "../context/TodoContext";
import type { TodoItemType } from "../types/TodoItemType";
import { buildTodoTree } from "../utils/TodoTree";
import TodoNode from "./TodoNode";
import TodoTable from "./TodoTable";

export default function TodoList(): JSX.Element {
  const todos = useTodos() ?? [];
  const [mode, setMode] = useState<"tree" | "table">(() => (localStorage.getItem("viewMode") as "tree" | "table") ?? "tree");

  useEffect(() => {
    try {
      localStorage.setItem("viewMode", mode);
    } catch {}
  }, [mode]);

  const roots = useMemo(() => buildTodoTree(todos || []), [todos]);

  return (
    <div>
      <div className="view-toggle" style={{ marginBottom: 12 }}>
        <button className={mode === "tree" ? "btn primary" : "btn"} onClick={() => setMode("tree")}>Tree</button>
        <button className={mode === "table" ? "btn primary" : "btn"} onClick={() => setMode("table")}>Table</button>
      </div>

      {mode === "table" ? (
        <TodoTable />
      ) : (
        <ul className="todo-root-list">
          {roots.map((t: TodoItemType) => (
            <TodoNode key={t.Id} node={t} />
          ))}
        </ul>
      )}
    </div>
  );
}