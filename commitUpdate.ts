import { context } from "./context";
import { Fiber } from "./fiber";

export function commitRootFiber(rootFiber: Fiber) {
  if (!rootFiber.child) return;

  context.deletedQueue.forEach((deletion) => commitFiberUpdate(deletion));
  context.deletedQueue = [];

  commitFiberUpdate(rootFiber.child);

  context.recentlyCommittedRootFiber = context.unCommitedRootFiber;
  context.unCommitedRootFiber = null;
}

export function commitFiberUpdate(fiber: Fiber) {
  let parentFiber: Nullable<Fiber> = fiber.parent!;
  while (parentFiber && parentFiber.dom === null) {
    parentFiber = parentFiber.parent;
  }

  const parentDom = parentFiber!.dom!;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    commitAddDom(parentDom, fiber);
  }

  if (fiber.effectTag === "UPDATE" && fiber.dom) {
    commitUpdateDomProerty(fiber.dom, fiber.alternate?.props, fiber.props);
  }

  if (fiber.effectTag === "DELETE") {
    commitDeleteDom(parentDom, fiber);
  }

  if (fiber.child) commitFiberUpdate(fiber.child);
  if (fiber.sibling) commitFiberUpdate(fiber.sibling);
}

export function commitUpdateDomProerty(
  dom: Node,
  prevProps: Record<string, unknown> = {},
  nextProps: Record<string, unknown> = {}
) {
  commitDeletedEventListener(dom, prevProps, nextProps);
  commitAddedEventListener(dom, prevProps, nextProps);
  commitDeletedProperty(dom, prevProps, nextProps);
  commitAddedProperty(dom, prevProps, nextProps);
}

export function commitAddDom(parent: Node, child: Fiber) {
  parent.appendChild(child.dom!);
}
export function commitDeleteDom(parent: Node, child: Fiber) {
  while (!child.dom) child = child.child!;
  parent.removeChild(child.dom);
}

export function isEvent(key: string) {
  return key.startsWith("on");
}

export function isProperty(key: string) {
  return key !== "children" && !isEvent(key);
}

export function isNewProperty(prevProps: Record<string, unknown>, nextProps: Record<string, unknown>) {
  return function (key: string) {
    return prevProps[key] !== nextProps[key];
  };
}

export function isDeletedProperty(prevProps: Record<string, unknown>, nextProps: Record<string, unknown>) {
  return function (key: string) {
    return key in prevProps && !(key in nextProps);
  };
}

export function getEventNameFromOnEvent(onEventName: string) {
  return onEventName.substring(2).toLowerCase();
}

export function commitDeletedEventListener(
  dom: Node,
  prevProps: Record<string, unknown> = {},
  nextProps: Record<string, unknown> = {}
) {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => isDeletedProperty(prevProps, nextProps)(key) || isNewProperty(prevProps, nextProps)(key))
    .forEach((key) =>
      dom.removeEventListener(
        getEventNameFromOnEvent(key),
        prevProps[key] as unknown as EventListenerOrEventListenerObject
      )
    );
}

export function commitAddedEventListener(
  dom: Node,
  prevProps: Record<string, unknown> = {},
  nextProps: Record<string, unknown> = {}
) {
  Object.keys(nextProps)
    .filter(isEvent)
    .filter((key) => isNewProperty(prevProps, nextProps)(key))
    .forEach((key) =>
      dom.addEventListener(
        getEventNameFromOnEvent(key),
        nextProps[key] as unknown as EventListenerOrEventListenerObject
      )
    );
}

export function commitDeletedProperty(
  dom: Node,
  prevProps: Record<string, unknown> = {},
  nextProps: Record<string, unknown> = {}
) {
  Object.keys(prevProps)
    .filter(isProperty)
    .filter((key) => isDeletedProperty(prevProps, nextProps)(key))
    .forEach((key) => delete dom[key as keyof Node]);
}

export function commitAddedProperty(
  dom: Node,
  prevProps: Record<string, unknown> = {},
  nextProps: Record<string, unknown> = {}
) {
  Object.keys(nextProps)
    .filter(isProperty)
    .filter((key) => isNewProperty(prevProps, nextProps)(key))
    .forEach((key) => (dom[key] = nextProps[key]));
}
