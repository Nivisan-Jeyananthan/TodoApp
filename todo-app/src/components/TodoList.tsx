import React, { useContext } from "react";
import TodoRow from "./TodoRow";
import { TodosContext } from "../context/TodoContext";



export default function TodoList(): React.JSX.Element {
    const todos = useContext(TodosContext);

    return (
        <table>
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                {todos?.map((x, i) => (
                    <tr key={i}>
                        <TodoRow todo={x}/>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}