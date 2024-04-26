import React, { useContext, useId, useReducer } from "react";
import { TodoItem, TodoItemDispatch, TodoItemDispatchType, TodoStatus } from "../types/TodoItem";


export const TodosContext = React.createContext<Array<TodoItem>>([]);
export const TodoDispatchContext = React.createContext<React.Dispatch<TodoItemDispatch> | null>(null);

const initialTodos: TodoItem[] = [
    { Id: useId(), Text: 'Your first Todo! :) ', Status: TodoStatus.New }
];

export function TodosProvider(props: { children: React.ReactNode }) {
    const [todos, dispatch] = useReducer(todosReducer, initialTodos);
    return (
        <TodosContext.Provider value={todos}>
            <TodoDispatchContext.Provider value={dispatch}>
                {props.children}
            </TodoDispatchContext.Provider>
        </TodosContext.Provider>
    )
}

export function useTodos() {
    return useContext(TodosContext);
}

export function useTodosDispatch() {
    return useContext(TodoDispatchContext);
}

function todosReducer(todos: TodoItem[], action: TodoItemDispatch): TodoItem[] {
    const { todo } = action;
    switch (action.type) {
        case TodoItemDispatchType.added:
            return [...todos, {
                Id: todo.Id,
                Text: todo.Text,
                Status: todo.Status
            }];
        case TodoItemDispatchType.changed:
            return todos.map(t => {
                if (t.Id === todo?.Id) {
                    return todo;
                }
                return t;
            })
        case TodoItemDispatchType.deleted:
            return todos.filter(t => t.Id !== todo?.Id);
        default:
            throw Error('Unknown todo?: ' + action.type);
    }
}
