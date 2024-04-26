export type TodoItem = {
    Id: string,
    Text: string,
    Status: TodoStatus,
}

export type TodoItemDispatch = {
    readonly type: TodoItemDispatchType,
    readonly todo: Partial<TodoItem>
}

export enum TodoItemDispatchType {
    added, changed, deleted
}


export enum TodoStatus {
    New,
    Done
}