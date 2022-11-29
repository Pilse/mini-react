export type Fiber = {
  type: any;
  alternate: Nullable<Fiber>;
  child: Nullable<Fiber>;
  sibling: Nullable<Fiber>;
  parent: Nullable<Fiber>;
  effectTag: Nullable<"UPDATE" | "DELETE" | "PLACEMENT">;
  hooks: Nullable<any[]>;
  dom: Nullable<Node>;
  props: Record<string, unknown> & { children: Fiber[] };
};

export function createFiber({
  type,
  alternate = null,
  child = null,
  sibling = null,
  parent = null,
  effectTag = null,
  hooks = null,
  dom = null,
  props = { children: [] },
}: Partial<Fiber>): Fiber {
  return {
    type,
    alternate,
    child,
    sibling,
    parent,
    effectTag,
    hooks,
    dom,
    props,
  };
}

export function getNextFiber(fiber: Fiber) {
  if (fiber.child) return fiber.child;

  if (fiber.sibling) return fiber.sibling;

  let nextFiber: Fiber | null = fiber;
  for (; nextFiber !== null; nextFiber = nextFiber.parent) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
  }

  return null;
}

export function isFunctionComponent(fiber: Fiber) {
  return fiber.type instanceof Function;
}

export function hasFiberHasEmptyChildren(fiber: Fiber) {
  return fiber.props.children.length === 0;
}
