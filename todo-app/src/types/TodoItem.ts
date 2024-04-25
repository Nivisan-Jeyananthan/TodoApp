export type TodoItem = {
    Id:string,
    Name: string,
    Status: TodoStatus,
}

export type TodoItemDispatch = TodoItem & {
type: TodoItemDispatchType,
todo?: TodoItem
}

export enum TodoItemDispatchType {
    added, changed, deleted
}


export enum TodoStatus {
    New,
    Done
}