import { context } from "./context";
import { createFiber, Fiber, hasFiberHasEmptyChildren } from "./fiber";

const FirstChild = 0;

export function reconcilFiberChildren(fiber: Fiber) {
  if (!fiber.alternate) {
    reconcilReplacedChildren(fiber, fiber.props.children);
    return;
  }

  if (hasFiberHasEmptyChildren(fiber)) {
    reconcilDeletedChildren(fiber.alternate.child);
    return;
  }

  reconcilChildrenCompareToAlternate(fiber, fiber.props.children, fiber.alternate.child);
}

export function reconcilReplacedChildren(
  parent: Fiber,
  children: Fiber[],
  from: number = 0,
  prevSibling: Nullable<Fiber> = null
) {
  for (let idx = from; idx < children.length; idx++) {
    const child = children[idx];

    const newFiber = createFiber({
      type: child.type,
      props: child.props,
      parent,
      effectTag: "PLACEMENT",
    });

    if (idx === FirstChild) {
      parent.child = newFiber;
      prevSibling = newFiber;
      continue;
    }

    prevSibling!.sibling = newFiber;
    prevSibling = newFiber;
  }
}

export function reconcilDeletedChildren(alternate: Nullable<Fiber>, prevSibling: Nullable<Fiber> = null) {
  while (alternate) {
    alternate.effectTag = "DELETE";
    if (prevSibling) {
      prevSibling.sibling = alternate;
    }
    prevSibling = alternate;
    alternate = alternate.sibling;
  }
}

export function reconcilChildrenCompareToAlternate(
  parent: Fiber,
  children: Fiber[],
  alternate: Nullable<Fiber>
) {
  let prevSibling: Nullable<Fiber> = null;
  let idx = 0;

  const childrenLength = children.length;

  while (idx < childrenLength && alternate) {
    const child = children[idx];
    const newFiber = getNewFiberByCompare(parent, alternate, child);

    if (newFiber.effectTag === "PLACEMENT") {
      alternate.effectTag = "DELETE";
      context.deletedQueue.push(alternate);
    }

    if (idx === FirstChild) {
      parent.child = newFiber;
      prevSibling = newFiber;
      idx++;
      alternate = alternate.sibling;
      continue;
    }

    idx++;
    alternate = alternate.sibling;
    prevSibling!.sibling = newFiber;
    prevSibling = newFiber;
  }

  reconcilDeletedChildren(alternate, prevSibling);
  reconcilReplacedChildren(parent, children, idx, prevSibling);
}

export function getNewFiberByCompare(parent: Fiber, alternate: Fiber, child: Fiber) {
  return isUpdated(alternate, child)
    ? createFiber({
        type: alternate.type,
        props: child.props,
        dom: alternate.dom,
        parent,
        alternate: alternate,
        effectTag: "UPDATE",
      })
    : createFiber({
        type: child.type,
        props: child.props,
        parent,
        effectTag: "PLACEMENT",
      });
}

export function isUpdated(oldFiber: Fiber, newFiber: Fiber) {
  return oldFiber.type === newFiber.type;
}
