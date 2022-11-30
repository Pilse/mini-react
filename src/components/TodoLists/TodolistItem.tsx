import React from "../../mini-react/react";

type TodolistItemProps = {
  listItem: string;
};

export default function TodoListItem({ listItem }: TodolistItemProps) {
  return <li>{listItem}</li>;
}
