export type TodoItemType = {
    Id?: number,
    Text?: string,
    Status?: TodoStatus,
    EndsAt?: Date
}

export type TodoItemKeys = keyof TodoItemType;

export type TodoItemDispatch = {
    readonly type: TodoItemDispatchType,
    readonly todo: Partial<TodoItemType>
}

export enum TodoItemDispatchType {
    added, changed, deleted
}


export enum TodoStatus {
    New = 0,
    Done = 1
}