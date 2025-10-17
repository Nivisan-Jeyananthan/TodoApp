import type { JSX } from "react";
import TodoList from "./TodoList";
import TodoInput from "./AddTodo";
import ImportExport from "./ImportExport";
import { TodosProvider } from "../context/TodoContext";

export default function TodoApp(): JSX.Element {
  return (
    <div>
      <TodosProvider>
        <ImportExport />
        <TodoInput />
        <br />
        <br />
        <TodoList />
      </TodosProvider>
    </div>
  );
}
