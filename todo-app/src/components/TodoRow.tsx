import React from 'react';
import type { TodoItem } from '../types/TodoItem';

interface ITodoRow {
    todo: TodoItem
}

export default function TodoRow(props: ITodoRow): JSX.Element {
    const { todo } = props;

    return (
        <>
            <th scope="row">{todo.Text}</th>
            <td>{todo.Status}</td>
        </>
    );
}