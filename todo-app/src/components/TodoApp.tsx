import React from "react";
import TodoList from "./TodoList";
import TodoInput from "./AddTodo";
import { TodosProvider } from "../context/TodoContext";

export default function TodoApp(): React.JSX.Element {
  return (
    <div>
      <TodosProvider>
        <TodoInput />
        <br />
        <br />
        <TodoList />
      </TodosProvider>
    </div>
  );
}
