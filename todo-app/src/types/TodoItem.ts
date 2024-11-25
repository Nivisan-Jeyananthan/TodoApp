export type TodoItem = {
    Id?: number,
    Text?: string,
    Status?: TodoStatus,
    EndsAt?: Date
}

export type TodoItemDispatch = {
    readonly type: TodoItemDispatchType,
    readonly todo: Partial<TodoItem>
}

export enum TodoItemDispatchType {
    added, changed, deleted
}


export enum TodoStatus {
    New = 0,
    Done = 1
}