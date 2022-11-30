import React from "../../mini-react/react";
import TodolistItem from "./TodolistItem";

type TodoListProps = {
  todolist: string[];
};

export default function TodoList({ todolist }: TodoListProps) {
  return (
    <ul>
      {todolist.map((listItem) => (
        <TodolistItem listItem={listItem} />
      ))}
    </ul>
  );
}
