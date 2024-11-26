import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TodoApp from "./components/TodoApp.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>,
);
