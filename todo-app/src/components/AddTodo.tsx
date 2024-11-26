import { useState, ChangeEvent, KeyboardEvent } from "react";
import type { JSX } from "react";
import {
  TodoItemType,
  TodoItemDispatchType,
  TodoStatus,
} from "../types/TodoItemType";
import { useTodosDispatch } from "../context/TodoContext";

export default function TodoInput(): JSX.Element {
  const [todoText, setTodoText] = useState<string>("");
  const dispatch = useTodosDispatch();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value.length >= 0) {
      setTodoText(event?.target?.value);
    }
  };

  const handleKeyDownEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleClickCreate();
    }
  };

  const handleClickCreate = () => {
    if (todoText && dispatch) {
      const temp: TodoItemType = {
        Text: todoText,
        Status: TodoStatus.New,
      };
      dispatch({ type: TodoItemDispatchType.added, todo: temp });
    }
  };

  return (
    <div className="todo-input">
      <input
        autoFocus={true}
        type="text"
        value={todoText}
        onChange={handleChange}
        onKeyDown={handleKeyDownEnter}
        placeholder="Get a little creative :D"
      />
      <button onClick={handleClickCreate}>Create</button>
    </div>
  );
}
