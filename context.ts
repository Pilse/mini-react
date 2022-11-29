import { Fiber } from "./fiber";

type Context = {
  recentlyCommittedRootFiber: Nullable<Fiber>;
  unCommitedRootFiber: Nullable<Fiber>;
  workInProgressFiber: Nullable<Fiber>;
  hookIndex: number;
  deletedQueue: Fiber[];
};

export const context: Context = {
  recentlyCommittedRootFiber: null,
  unCommitedRootFiber: null,
  workInProgressFiber: null,
  hookIndex: 0,
  deletedQueue: [],
};

export function canCommit(context: Context) {
  return context.workInProgressFiber === null && context.unCommitedRootFiber !== null;
}

export function isWorkInProgress(workInProgressFiber: Fiber | null): workInProgressFiber is Fiber {
  return workInProgressFiber !== null;
}
