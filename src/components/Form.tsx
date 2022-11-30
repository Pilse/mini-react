import React from "../mini-react/react";

type FormProps = {
  onSubmit: (event: Event) => void;
  children?: Node;
};

export default function Form({ onSubmit, children }: FormProps) {
  return <form onSubmit={onSubmit}>{children}</form>;
}
