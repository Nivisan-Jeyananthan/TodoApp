import React, { useContext, useId, useReducer } from "react";
import { TodoItem, TodoItemDispatch, TodoItemDispatchType, TodoStatus } from "../types/TodoItem";


export const TodosContext = React.createContext<Array<TodoItem>>([]);
export const TodoDispatchContext = React.createContext(null);


export function TodosProvider(children:  React.ReactNode) {
    const [todos, dispatch] = useReducer(todosReducer, initialTodos);

    return (
        <TodosContext.Provider value={todos}>
            <TodoDispatchContext.Provider value={dispatch}>
                {children}
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

function todosReducer(todos: Array<TodoItem>, action: TodoItemDispatch): Array<TodoItem> {
    switch (action.type) {
        case TodoItemDispatchType.added:
            return [...todos, {
                Id: action.Id,
                Name: action.Name,
                Status: action.Status
            }];
        case TodoItemDispatchType.changed:
            return todos.map(t => {
                if (t.Id === action.Id) {
                    return action.todo;
                }
                return t;
            })
        case TodoItemDispatchType.deleted:
            return todos.filter(t => t.Id !== action.Id);
        default:
            throw Error('Unknown action: ' + action.type);
    }
}

const initialTodos = [
    { Id: useId(), Name: 'Your first Todo! :) ', Status: TodoStatus.New }
];