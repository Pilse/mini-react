import React from "./mini-react/react";

function App(props: { name: string }) {
  const [counter, setCounter] = React.useState(2);
  return (
    <h1 onClick={() => setCounter((prev) => prev + 1)}>
      Hi {props.name}
      {counter % 2 === 0 ? <h1>{counter}</h1> : <h2>pp</h2>}
    </h1>
  );
}
const element = (
  <div id="foo">
    123
    <App name="foo" />
  </div>
);
const container = document.getElementById("root");
React.render(element, container);
