import React, { useId, useState } from "react";
import { TodoItem, TodoItemDispatchType, TodoStatus } from "../types/TodoItem";
import { useTodosDispatch } from "../context/TodoContext";


export default function TodoInput(): React.JSX.Element {
    const [todoText, setTodoText] = useState<string>("");
    const dispatch = useTodosDispatch();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.value.length >= 0) {
            setTodoText(event?.target?.value);
        }
    }

    const handleClick = () => {
        if (todoText) {
            let temp: TodoItem = {
                Id: useId(),
                Name: todoText,
                Status: TodoStatus.New
            }
            dispatch({ type: TodoItemDispatchType.added, Id: useId(),Name: todoText,Status: TodoStatus.New })
        }
    }

    return (
        <>
            <input type="text" value={todoText} onChange={handleChange} />
            <button onClick={handleClick}>Create</button>
        </>
    );
}