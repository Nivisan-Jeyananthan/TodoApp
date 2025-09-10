import { TodoItemType } from "../types/TodoItemType";

// Build a tree structure from a flat list of todos
// Each todo will have a 'children' property containing its sub-todos
// Todos without a ParentId are considered root nodes
export function buildTodoTree(todos: TodoItemType[]) {
  const map = new Map<string, TodoItemType & { children?: typeof todos }>();
  todos.forEach(t => map.set(t.Id, { ...t, children: [] }));
  const roots: (TodoItemType & { children?: typeof todos })[] = [];
  for (const t of map.values()) {
    if (t.ParentId) {
      const parent = map.get(t.ParentId);
      if (parent) parent.children!.push(t);
      else roots.push(t);
    } else {
      roots.push(t);
    }
  }
  return roots;
}