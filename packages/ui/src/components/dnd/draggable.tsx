import * as React from "react";
import { useDrag } from "@react-aria/dnd";
import type { DragEndEvent, DragStartEvent } from "@react-types/shared";

interface Props<T> {
  data: T;
  children({ isDragging }: { isDragging: boolean }): React.ReactElement;
  isDisabled?: boolean;
  onDragStart?(e: DragStartEvent): void;
  onDragEnd?(e: DragEndEvent): void;
}

export function Draggable<T>(props: Props<T>) {
  const { dragProps, isDragging } = useDrag({
    onDragEnd: props.onDragEnd,
    onDragStart: props.onDragStart,
    getItems() {
      return [{ "application/json": JSON.stringify(props.data) }];
    },
  });

  const children = props.children({ isDragging });
  const [child, ...rest] = Array.isArray(children) ? children : [children];

  const copied = React.cloneElement(child as React.ReactElement, {
    id: "test-draggable",
    ...(props.isDisabled ? {} : dragProps),
    tabIndex: 0,
  });

  console.log({ copied });

  return (
    <>
      {copied}
      {rest}
    </>
  );
}
