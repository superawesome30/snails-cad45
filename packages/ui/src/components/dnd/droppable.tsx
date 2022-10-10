import * as React from "react";
import { useDrop } from "@react-aria/dnd";
import type { DropEnterEvent } from "@react-types/shared";

interface Props {
  children: React.ReactNode;
  isDisabled?(e: DropEnterEvent): boolean;
  onDrop(item: any): Awaited<void>;
}

export function Droppable(props: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const { dropProps } = useDrop({
    ref,
    onDropEnter(e) {
      props.isDisabled?.(e);
    },
    async onDrop(e) {
      console.log({ e });

      const [item] = await Promise.all(
        e.items.map((item) => {
          if (item.kind === "text" && item.types.has("application/json")) {
            console.log({ item });

            return item.getText("application/json");
          }

          return null;
        }),
      );

      if (!item) return;

      props.onDrop(JSON.parse(item));
    },
  });

  const [child] = Array.isArray(props.children) ? props.children : [props.children];

  const copied = React.cloneElement(child as React.ReactElement, {
    ...(props.isDisabled ? {} : dropProps),
    ref: props.isDisabled ? undefined : ref,
    tabIndex: 0,
  });

  return copied;
}
