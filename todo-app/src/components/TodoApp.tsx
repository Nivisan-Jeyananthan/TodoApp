import React, { useId, useReducer, useState } from "react";
import TodoList from "./TodoList";
import TodoInput from "./AddTodo";
import { TodoItem } from "../types/TodoItem";
import { TodoDispatchContext, TodosContext, TodosProvider } from "../context/TodoContext";

export default function TodoApp(): React.JSX.Element {


    return (
        <div>
            <TodosProvider>
                <TodoInput />
                <TodoList />
            </TodosProvider>
        </div>
    );
}