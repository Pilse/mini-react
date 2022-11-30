import React from "../mini-react/react";

type InputProps = {
  value: string;
  onInput: (event: Event) => void;
};

export default function Input({ value, onInput }: InputProps) {
  return <input type="text" value={value} onInput={onInput} />;
}
