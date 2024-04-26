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

    const handleClickCreate = () => {
        if (todoText) {
            let temp: TodoItem = {
                Id: useId(),
                Text: todoText,
                Status: TodoStatus.New
            }
            dispatch({ type: TodoItemDispatchType.added, todo: temp})
        }
    }

    return (
        <>
            <input type="text" value={todoText} onChange={handleChange} />
            <button onClick={handleClickCreate}>Create</button>
        </>
    );
}