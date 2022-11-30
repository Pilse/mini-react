import { context } from "./context";
import { Fiber, NodeProps, FiberProps, createDefaultProps } from "./fiber";

export function commitRootFiber(rootFiber: Fiber) {
  if (!rootFiber.child) return;

  context.deletedQueue.forEach(commitFiberUpdate);
  context.deletedQueue = [];

  commitFiberUpdate(rootFiber.child);

  context.recentlyCommittedRootFiber = context.unCommitedRootFiber;
  context.unCommitedRootFiber = null;
}

export function getParentFiber(fiber: Fiber) {
  let parentFiber: Nullable<Fiber> = fiber.parent;
  while (parentFiber && !!!parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }
  return parentFiber;
}

export function commitFiberUpdate(fiber: Fiber) {
  const parentFiber = getParentFiber(fiber);

  if (!parentFiber || !parentFiber.dom) return;

  const parentDom = parentFiber.dom;

  if (fiber.type && fiber.effectTag === "PLACEMENT" && fiber.dom) {
    commitAddDom(parentDom, fiber);
  }

  if (fiber.type && fiber.effectTag === "UPDATE" && fiber.dom) {
    commitUpdateDomProerty(fiber.dom, fiber.alternate?.props, fiber.props);
  }

  if (fiber.type && fiber.effectTag === "DELETE") {
    commitDeleteDom(parentDom, fiber);
  }

  if (fiber.child) commitFiberUpdate(fiber.child);
  if (fiber.sibling) commitFiberUpdate(fiber.sibling);
}

export function commitUpdateDomProerty(
  dom: Node,
  prevProps: FiberProps = createDefaultProps(),
  nextProps: FiberProps
) {
  commitDeletedEventListener(dom, prevProps, nextProps);
  commitAddedEventListener(dom, prevProps, nextProps);
  commitDeletedProperty(dom, prevProps, nextProps);
  commitAddedProperty(dom, prevProps, nextProps);
}

export function commitAddDom(parent: Node, child: Fiber) {
  if (!child.dom) return;
  parent.appendChild(child.dom);
}

export function commitDeleteDom(parent: Node, child: Fiber) {
  while (!child.dom) child = child.child!;
  parent.removeChild(child.dom);
}

export function isEvent(key: string) {
  return key.startsWith("on");
}

export function isProperty(key: string): key is keyof NodeProps {
  return key !== "children" && !isEvent(key);
}

export function isNewProperty(prevProps: FiberProps, nextProps: FiberProps) {
  return function (key: string): key is keyof NodeProps {
    return prevProps[key] !== nextProps[key];
  };
}

export function isDeletedProperty(prevProps: FiberProps, nextProps: FiberProps) {
  return function (key: string): key is keyof NodeProps {
    return key in prevProps && !(key in nextProps);
  };
}

export function getEventNameFromOnEvent(onEventName: string) {
  return onEventName.substring(2).toLowerCase();
}

export function commitDeletedEventListener(dom: Node, prevProps: FiberProps, nextProps: FiberProps) {
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

export function commitAddedEventListener(dom: Node, prevProps: FiberProps, nextProps: FiberProps) {
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

export function commitDeletedProperty(dom: Node, prevProps: FiberProps, nextProps: FiberProps) {
  Object.keys(prevProps)
    .filter(isProperty)
    .filter((key) => isDeletedProperty(prevProps, nextProps)(key))
    .forEach((key) => delete dom[key as keyof Node]);
}

export function commitAddedProperty(dom: Node, prevProps: FiberProps, nextProps: FiberProps) {
  Object.keys(nextProps)
    .filter(isProperty)
    .filter((key) => isNewProperty(prevProps, nextProps)(key))
    .forEach(<T extends keyof NodeProps>(key: T) => {
      dom[key] = nextProps[key] as Node[T];
    });
}
