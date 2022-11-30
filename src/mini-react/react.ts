import { context } from "../core/context";
import { createFiber, Fiber } from "../core/fiber";
import { updateRootFiberIfIdle } from "../core/fiberUpdates";

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
      children: children.flatMap((child) => (typeof child === "object" ? child : createTextElement(child))),
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
  actions: (Function | T)[];
};
function useState<T>(initial: T): [T, (action: T | ((prev: T) => void)) => void] {
  const alternate = context.workInProgressFiber?.alternate;
  const oldHook: Nullable<HookState<T>> = alternate?.hooks ? alternate.hooks[context.hookIndex] : null;

  const hook: HookState<T> = {
    state: oldHook ? oldHook.state : initial,
    actions: [],
  };

  const actions = oldHook ? oldHook.actions : [];
  actions.forEach((action) => {
    hook.state = action instanceof Function ? action(hook.state) : action;
  });

  const setState = (action: Function | T) => {
    hook.actions.push(action);

    context.unCommitedRootFiber = createFiber({
      dom: context.recentlyCommittedRootFiber?.dom,
      props: context.recentlyCommittedRootFiber?.props,
      alternate: context.recentlyCommittedRootFiber,
    });
    context.workInProgressFiber = context.unCommitedRootFiber;
    context.deletedQueue = [];

    requestIdleCallback(updateRootFiberIfIdle);
  };

  context.workInProgressFiber?.hooks?.push(hook);
  context.hookIndex++;

  return [hook.state, setState];
}

const React = {
  createElement,
  render,
  useState,
};

export default React;
