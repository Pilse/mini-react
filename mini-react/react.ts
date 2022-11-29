import { context } from "../context";
import { createFiber, Fiber } from "../fiber";
import { updateRootFiberIfIdle } from "../fiberUpdates";

function render(element: Fiber, container: Nullable<Node>) {
  context.unCommitedRootFiber = createFiber({
    dom: container,
    props: {
      children: [element],
    },
  });
  context.workInProgressFiber = context.unCommitedRootFiber;

  requestIdleCallback(updateRootFiberIfIdle);
}

function createElement(type: any, props: object, ...children: Fiber[]) {
  return createFiber({
    type: type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === "object" ? child : createTextElement(child))),
    },
  });
}

function createTextElement(text: string) {
  return createFiber({
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  });
}

type HookState<T> = {
  state: T;
  actions: Function[];
};
function useState<T>(initial: T) {
  const alternate = context.workInProgressFiber?.alternate;
  const oldHook: Nullable<HookState<T>> = alternate?.hooks ? alternate.hooks[context.hookIndex] : null;

  const hook: HookState<T> = {
    state: oldHook ? oldHook.state : initial,
    actions: [],
  };

  const actions = oldHook ? oldHook.actions : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action: Function) => {
    hook.actions.push(action);
    context.unCommitedRootFiber = createFiber({
      dom: context.recentlyCommittedRootFiber?.dom,
      props: context.recentlyCommittedRootFiber?.props,
      alternate: context.recentlyCommittedRootFiber,
    });
    context.workInProgressFiber = context.unCommitedRootFiber;
    requestIdleCallback(updateRootFiberIfIdle);
  };

  context.workInProgressFiber!.hooks!.push(hook);
  context.hookIndex++;

  return [hook.state, setState];
}

const React = {
  createElement,
  render,
  useState,
};

export default React;
