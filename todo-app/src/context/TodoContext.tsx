import { useContext, useReducer, createContext, Dispatch } from "react";
import { TodoStatus, TodoItemDispatchType } from "../types/TodoItemType";
import type { TodoItemType, TodoItemDispatch } from "../types/TodoItemType";
import type { ReactNode } from "react";

export const TodosContext = createContext<Array<TodoItemType> | null>(null);
export const TodoDispatchContext =
  createContext<Dispatch<TodoItemDispatch> | null>(null);

const storedTodos = JSON.parse(
  localStorage.getItem("todos") ?? "[]",
) as TodoItemType[];
const initialTodos: TodoItemType[] =
  storedTodos.length > 0
    ? storedTodos
    : [{ Id: 0, Text: "Your first Todo! :) ", Status: TodoStatus.New }];

export function TodosProvider(props: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todosReducer, initialTodos);

  return (
    <TodosContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        {props.children}
      </TodoDispatchContext.Provider>
    </TodosContext.Provider>
  );
}

export function useTodos() {
  return useContext(TodosContext);
}

export function useTodosDispatch() {
  return useContext(TodoDispatchContext);
}

function todosReducer(
  todos: TodoItemType[],
  action: TodoItemDispatch,
): TodoItemType[] {
  const { todo } = action;
  let updatedTodos: TodoItemType[];
  switch (action.type) {
    case TodoItemDispatchType.added:
      updatedTodos = [
        ...todos,
        { Id: Math.random(), Text: todo.Text, Status: todo.Status, EndsAt: todo.EndsAt },
      ];
      break;
    case TodoItemDispatchType.changed:
      updatedTodos = todos.map((t) => {
        if (t.Id === todo?.Id) {
          return todo;
        }
        return t;
      });
      break;
    case TodoItemDispatchType.deleted:
      updatedTodos = todos.filter((t) => t?.Id !== todo?.Id);
      break;
    default:
      throw new Error("Unknown operation ?:\n " + action.type);
  } // Save updated todos to local storage

  localStorage.setItem("todos", JSON.stringify(updatedTodos));
  return updatedTodos;
}
