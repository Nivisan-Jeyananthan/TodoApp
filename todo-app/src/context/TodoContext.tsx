import { useContext, useReducer, createContext, Dispatch } from "react";
import { TodoStatus, TodoItemDispatchType } from "../types/TodoItemType";
import type { TodoItemType, TodoItemDispatch } from "../types/TodoItemType";
import type { ReactNode } from "react";

export const TodosContext = createContext<Array<TodoItemType> | null>(null);
export const TodoDispatchContext =
  createContext<Dispatch<TodoItemDispatch> | null>(null);

// Load stored todos and revive Dates
const _raw = localStorage.getItem("todos");
const _parsed = _raw ? (JSON.parse(_raw) as any[]) : [];
const storedTodos: TodoItemType[] = _parsed.map((t) => ({
  ...t,
  EndsAt: t?.EndsAt ? new Date(t.EndsAt) : undefined,
}));
const initialTodos: TodoItemType[] =
  storedTodos.length > 0
    ? storedTodos
    : [{ Id: crypto.randomUUID(), Text: "Your first Todo! :) ", Status: TodoStatus.New }];

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
      const newTodo: TodoItemType = {
        Id: todo?.Id ?? crypto.randomUUID(),
        Text: todo?.Text ?? "",
        Status: todo?.Status ?? TodoStatus.New,
        ParentId: (todo as any)?.ParentId,
        EndsAt: todo?.EndsAt ? (todo.EndsAt instanceof Date ? todo.EndsAt : new Date(todo.EndsAt)) : undefined,
      };
      updatedTodos = [...todos, newTodo];
      break;
    case TodoItemDispatchType.changed:
      updatedTodos = todos.map((t) => {
        if (t.Id === todo?.Id) {
          return todo as TodoItemType;
        }
        return t;
      });
      break;
    case TodoItemDispatchType.deleted:
      if (!todo?.Id) {
        updatedTodos = todos;
        break;
      }
      // collect id and all descendants
      const idsToRemove = new Set<string>();
      const collect = (id: string) => {
        idsToRemove.add(id);
        todos.forEach((tt) => {
          if (tt.ParentId === id && !idsToRemove.has(tt.Id)) collect(tt.Id);
        });
      };
      collect(todo.Id);
      updatedTodos = todos.filter((t) => !idsToRemove.has(t.Id));
      break;
    default:
      throw new Error("Unknown operation ?:\n " + action.type);
  }

  // Save updated todos to local storage (Dates will be serialized to ISO strings)
  localStorage.setItem("todos", JSON.stringify(updatedTodos));
  return updatedTodos;
}


