import React, { useContext } from "react";
import TodoRow from "./TodoRow";
import { TodosContext } from "../context/TodoContext";

export default function TodoList(): React.JSX.Element {
  const todos = useContext(TodosContext);

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
          <th scope="col">Date</th>
          <th scope="col">Delete</th>
        </tr>
      </thead>
      <tbody>
        {todos?.map((x) => (
          <tr key={x.Id}>
            <TodoRow todo={x} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
