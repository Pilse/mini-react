import React from "../mini-react/react";
import Form from "./Form";
import Input from "./Input";
import TodoList from "./TodoLists/TodoList";

export default function App() {
  const [todolist, setTodolist] = React.useState(["1", "2"]);
  const [newListItem, setNewListItem] = React.useState("");

  function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    setNewListItem(() => target.value);
  }

  function onSumbit(event: Event) {
    event.preventDefault();
    setTodolist((prev) => [...prev, newListItem]);
    setNewListItem("");
  }

  return (
    <>
      <Form onSubmit={onSumbit}>
        <Input value={newListItem} onInput={onInput} />
      </Form>

      <TodoList todolist={todolist} />
    </>
  );
}
