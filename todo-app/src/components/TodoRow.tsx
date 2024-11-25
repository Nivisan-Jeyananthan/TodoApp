import React, { useState } from "react";
import { TodoItem, TodoItemDispatchType, TodoStatus } from "../types/TodoItem";
import { useTodosDispatch } from "../context/TodoContext";

interface ITodoRow {
  todo: TodoItem;
}

const formattedEndDate = (d: Date) =>
  d.toLocaleDateString("de-CH", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function TodoRow(props: ITodoRow): JSX.Element {
  const { todo } = props;
  const [todoStatus, setTodoStatus] = useState<boolean>(
    todo.Status === TodoStatus.Done
  );
  const dispatch = useTodosDispatch();

  const handleCheck = (_: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = !todoStatus;
    setTodoStatus(newStatus);
    if (dispatch) {
      const updatedTodo: TodoItem = {
        ...todo,
        Status: newStatus ? TodoStatus.Done : TodoStatus.New,
      };
      dispatch({ type: TodoItemDispatchType.changed, todo: updatedTodo });
    }
  };

  const handleDelete = () => {
    if (dispatch) {
      dispatch({ type: TodoItemDispatchType.deleted, todo: todo });
    }
  };

  return (
    <>
      <td scope="row">{todo.Text}</td>
      <td>
        <input
          type="checkbox"
          name="done-status"
          checked={todoStatus}
          onChange={handleCheck}
        />
      </td>
      <td>
        <p>{formattedEndDate(todo.EndsAt ?? new Date())}</p>
      </td>
      <td>
        <button className="danger" onClick={handleDelete}>
          ¯\_(ツ)_/¯
        </button>
      </td>
    </>
  );
}

export default React.memo(TodoRow);
