import { createDefaultProps, Fiber, getNextFiber, isFunctionComponent } from "./fiber";
import { canCommit, context, isWorkInProgress } from "./context";
import { reconcilFiberChildren } from "./fiberReconcil";
import { commitAddedEventListener, commitAddedProperty, commitRootFiber } from "./commitUpdate";

export function updateRootFiberIfIdle(deadLine: IdleDeadline) {
  let shouldYield = false;
  while (context.workInProgressFiber && !shouldYield) {
    context.workInProgressFiber = updateFiberByType(context.workInProgressFiber);
  }
  shouldYield = deadLine.timeRemaining() < 1;

  if (canCommit(context)) {
    commitRootFiber(context.unCommitedRootFiber!);
    return;
  }

  requestIdleCallback(updateRootFiberIfIdle);
}

export function updateFiberByType(fiber: Fiber) {
  const updateComponentFunction = isFunctionComponent(fiber) ? updateFunctionComponent : updateHostComponent;

  updateComponentFunction(fiber);

  return getNextFiber(fiber);
}

export function updateFunctionComponent(fiber: Fiber) {
  if (!isWorkInProgress(context.workInProgressFiber)) return;

  context.workInProgressFiber.hooks = [];
  context.hookIndex = 0;

  fiber.props.children = [fiber.type(fiber.props)];

  reconcilFiberChildren(fiber);
}
export function updateHostComponent(fiber: Fiber) {
  fiber.dom = fiber.dom ?? createDom(fiber);

  reconcilFiberChildren(fiber);
}

export function createDom(fiber: Fiber) {
  if (fiber.type === undefined) return null;

  const dom: Node =
    fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

  commitAddedProperty(dom, createDefaultProps(), fiber.props);
  commitAddedEventListener(dom, createDefaultProps(), fiber.props);

  return dom;
}
