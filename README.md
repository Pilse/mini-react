# mini-react

이 프로젝트는 react가 리렌더링 시 사용하는 `fiber` 자료구조를 간단히 구현해보는 것을 목표로 합니다.

`/src/core` 에서는 react의 `reconcilation` 과 `commit`을 구현했습니다.

`/src/mini-react` 에서는 react가 제공하는 함수인 `createElement`, `render`, `useState`를 구현하였습니다.

`/src/components` 에서는 위에서 구현한 내용들을 바탕으로 todolist 예제에 필요한 컴포넌트들을 구현했습니다.

`사용 언어`: **TypeScript**


## Reconcilation

`reconcilation`은 react가 어떤 부분을 다시 렌더링 해야할 지 알기 위해, 변경해야할 부분을 찾는데에 사용하는 알고리즘입니다. 

기존에는 트리를 순회하면서 재귀적으로 `reconcilation` 알고리즘을 사용했습니다.
이러한 방식은 문제점이 존재합니다. 한번 `reconcil` 작업을 시작하면 멈출 수 없기 때문에 메인 스레드는 한동안 block하게 됩니다. 이는 곧 우선순위가 높은 작업들이 처리되지 못하는 것을 의미합니다. 

이러한 문제를 해결하고자 react는 문제를 작은 단위로 나누었고 작은 문제를 해결 할 때 마다 우선순위에 따라 작업 순서를 조정함으로써 동시성을 높이려 했습니다. 이것이 `fiber`의 등장 배경입니다.

## Fiber

`fiber`의 가장 큰 목표는 작업을 작은 단위로 쪼개어 우선순위가 높은 작업부터 처리하는 것입니다.
`fiber` 자료구조는 `child`와 `silbing` 필드를 가지고 이는 각각 다른 `fiber`를 가리킬 수 있습니다 이 `child` 와 `sibling` 필드를 통해 `fiber` 자료구조를 순회할 수 있습니다.

<img width="479" alt="image" src="https://user-images.githubusercontent.com/71018111/205642848-1dfcf159-59e1-4579-b973-ff8e77f313ba.png">

순회하는 방법은 다음과 같습니다.
1. `fiber`에 `child` 필드 값이 존재한다면 `child` 로 이동한다.
2. `fiber`에 `sibling`이 존재한다면 `sibling`으로 이동한다
3. `child`와 `sibling`이 모두 존재하지 않는다면 `parent`의 `sibling` 으로 이동한다.
4. `parent`의 `sibling`이 존재하지 않는다면 `sibling`을 찾을 때 까지 `parent`를 찾아 위로 올라간다.

만약 root fiber에 도달한다면 `fiber` 자료구조의 순회를 마친 것입니다.

`fiber` 자료구조의 또 다른 필드로는 `alternate`이 있습니다. 이는 이전 `reconcilation`의 결과 `fiber`가 들어갈 수 있습니다.
이 `alternate` 필드와 현재 `fiber`를 비교하여 해당 fiber가 리렌더링의 대상이 되는지 여부를 파악할 수 있습니다.

## requestIdleCallback

위에서 `fiber` 자료구조에 대해 간단히 알아봤습니다. `fiber`를 통해 작업을 나누었으니 이제 나눈 작업을 우선순위에 맞게 처리해야합니다.
web API에서 제공하는 `requestIdleCallback` 함수를 사용하면 이를 쉽게 달성할 수 있습니다.

`requestIdleCallback`을 사용하면 메인스레드가 작업을 하지 않을 때 콜백으로 등록된 함수를 실행시키면서 앞서 목표였던 동시성을 만족시킬 수 있습니다.

> 실제 react는 더 이상 `requestIdleCallback` 를 사용하지 않고 독자적인 스케쥴러를 만들어 사용하고 있습니다.

## Commit, Rerender

`reconcilation` 작업이 모두 종료되면 변경이 필요한 부분을 리렌더링해주는 과정이 필요합니다.
react는 `reconcilation` 과 `rerender`를 구분해 놓았습니다.
이를 통해 `react-native`처럼 `DOM`을 사용하지 않더라도 `reconcilation`까지는 동일한 로직을 사용할 수 있습니다.


## 한계

react에서는 `reconcilation`과 `rerender`을 분리하지만 해당 프로젝트에서는 구현의 편리함을 위해 `fiber` 자료구조에 `dom` 필드를 만들어 관리했습니다.

state에 변경이 생겨 리렌더링이 발생하는 경우 react에서는 변경이 발생한 컴포넌트에 대해서만 `reconcilation`을 진행하지만 해당 프로젝트에서는 `root fiber` 부터 `reconcilation`을 진행합니다.


