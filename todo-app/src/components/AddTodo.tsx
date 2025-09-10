import { useState, ChangeEvent, KeyboardEvent } from "react";
import type { JSX } from "react";
import {
  TodoItemType,
  TodoItemDispatchType,
  TodoStatus,
} from "../types/TodoItemType";
import { useTodosDispatch } from "../context/TodoContext";
import NumberInput from "./NumberInput";

interface ITodoInputProps{
  parentId?: string;
  onCreated?: () => void;
}

export default function TodoInput(props: ITodoInputProps): JSX.Element {
  const [doneIn, setDoneIn] = useState<number>(0);
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
        Id: crypto.randomUUID(), 
        Text: todoText,
        Status: TodoStatus.New,
        ParentId: props.parentId,
        EndsAt: doneIn ? new Date(Date.now() + doneIn * 60 * 60 * 1000) : undefined
      };

      dispatch({ type: TodoItemDispatchType.added, todo: temp });
      setTodoText("");
      setDoneIn(0);
      props.onCreated?.();
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
      <NumberInput value={doneIn} onChange={setDoneIn} placeholder="Done in (hours)" min={0} max={365} />

      <button onClick={handleClickCreate}>Create</button>
    </div>
  );
}
