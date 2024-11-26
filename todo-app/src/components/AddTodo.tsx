import React, { useState } from "react";
import { TodoItem, TodoItemDispatchType, TodoStatus } from "../types/TodoItemType";
import { useTodosDispatch } from "../context/TodoContext";

export default function TodoInput(): React.JSX.Element {
  const [todoText, setTodoText] = useState<string>("");
  const dispatch = useTodosDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value.length >= 0) {
      setTodoText(event?.target?.value);
    }
  };

  const handleKeyDownEnter = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleClickCreate();
    }
  };

  const handleClickCreate = () => {
    if (todoText && dispatch) {
      let temp: TodoItem = {
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
