import { useState, memo } from "react";
import { TodoItemDispatchType, TodoStatus } from "../types/TodoItemType";
import type { TodoItemType } from "../types/TodoItemType";
import { useTodosDispatch } from "../context/TodoContext";
import { formattedEndDate } from "../utils/DateUtils";

interface ITodoRow {
  todo: TodoItemType;
}

interface ITodoRow {
  todo: TodoItemType;
}

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
      const updatedTodo: TodoItemType = {
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
    <tr key={todo.Id} className={todoStatus ? "todo-done" : ""}>
      <td>{todo.Text}</td>
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
    </tr>
  );
}

export default memo(TodoRow);
