export type TodoItemType = {
  Id: string;
  Text?: string;
  Status?: TodoStatus;
  EndsAt?: Date;
  ParentId?: string;
};

export type TodoItemKeys = keyof TodoItemType;

export type TodoItemDispatch = {
  readonly type: TodoItemDispatchType;
  readonly todo: Partial<TodoItemType>;
};

export enum TodoItemDispatchType {
  added,
  changed,
  deleted,
}

export enum TodoStatus {
  New = 0,
  Done = 1,
}
