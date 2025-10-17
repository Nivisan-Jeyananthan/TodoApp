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
  readonly todo?: Partial<TodoItemType>;
  /** Optional payload for operations that act on the whole list (e.g. import/replace) */
  readonly todos?: TodoItemType[];
};

export enum TodoItemDispatchType {
  added,
  changed,
  deleted,
  replaced,
}

export enum TodoStatus {
  New = 0,
  Done = 1,
}
