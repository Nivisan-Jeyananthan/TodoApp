import React, { useContext } from "react";
import TodoRow from "./TodoRow";
import { TodosContext } from "../context/TodoContext";

export default function TodoList(): React.JSX.Element {
  const todos = useContext(TodosContext);

  return (
    <table>
      <tbody>
        {todos?.map((x) => (
          <TodoRow key={x.Id} todo={x} />
        ))}
      </tbody>
    </table>
  );
}
