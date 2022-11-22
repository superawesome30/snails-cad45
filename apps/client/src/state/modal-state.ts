import * as React from "react";
import type { ModalIds } from "types/ModalIds";
import create from "zustand";
import shallow from "zustand/shallow";

type Payloads = Record<string, unknown>;

interface ModalState {
  canBeClosed: boolean;
  open: ModalIds[];
  payloads: Payloads;

  actions: {
    setCanBeClosed(value: boolean): void;
    closeModal(id: ModalIds): void;
    openModal<T = unknown>(id: ModalIds, payload?: T): void;
  };
}

// interface UseModal extends Pick<ModalState, "canBeClosed" | "actions"> {
//   isOpen(id: ModalIds): boolean;
//   closeModal(id: ModalIds): void;
//   openModal<T = unknown>(id: ModalIds, payload?: T): void;
//   getPayload<T = unknown>(id: ModalIds): T | null;
// }

const useModalStore = create<ModalState>()((set, get) => ({
  open: [],
  payloads: {},
  canBeClosed: true,

  actions: {
    setCanBeClosed(value: boolean) {
      set({ canBeClosed: value });
    },

    openModal<Payload = unknown>(id: ModalIds, payload: Payload) {
      set((state) => ({
        open: state.open.includes(id) ? state.open : [...state.open, id],
        payloads: { ...state.payloads, [id]: payload },
      }));
    },

    closeModal(id: ModalIds) {
      console.log({ id });

      set((state) => ({
        open: state.open.filter((openId) => openId !== id),
        payloads: { ...state.payloads, [id]: undefined },
      }));
    },
  },
}));

export const useModalActions = () => useModalStore((state) => state.actions);
export const useModalState = (stateFn?: (_state: ModalState) => any) =>
  useModalStore((state) => ({
    canBeClosed: state.canBeClosed,
    open: state.open,
    payloads: state.payloads,
  }));

export function useIsModalState() {
  const { open, payloads } = useModalStore(
    (state) => ({
      open: state.open,
      payloads: state.payloads,
    }),
    shallow,
  );

  const isOpen = React.useCallback(
    (id: ModalIds) => {
      return open.includes(id);
    },
    [open],
  );

  const getPayload = React.useCallback(
    <T = unknown>(id: ModalIds) => {
      return (payloads[id] ?? null) as T | null;
    },
    [payloads],
  );

  return { getPayload, isOpen };
}

// export function useModal(): never {
//   const modalState = useModalState();
//   const actions = useModalActions();

//   const canBeClosed = React.useMemo(() => modalState.canBeClosed, [modalState.canBeClosed]);

//   const isOpen = React.useCallback(
//     (id: ModalIds) => {
//       return modalState.open.includes(id);
//     },
//     [modalState.open],
//   );

//   const getPayload = React.useCallback(
//     <T = unknown>(id: ModalIds) => {
//       return (modalState.payloads[id] ?? null) as T | null;
//     },
//     [modalState.payloads],
//   );

//   const openModal = React.useCallback(
//     <T = unknown>(id: ModalIds, payload?: T) => {
//       if (isOpen(id)) return;

//       actions.setPayloads({ ...modalState.payloads, [id]: payload });
//       actions.setOpen([...modalState.open, id]);
//     },
//     [isOpen, modalState.open, modalState.payloads], // eslint-disable-line
//   );

//   const closeModal = (id: ModalIds) => {
//     if (!isOpen(id)) return;

//     actions.setPayloads({ ...modalState.payloads, [id]: undefined });
//     actions.setOpen(modalState.open.filter((v) => v !== id));
//   };

//   return {
//     canBeClosed,

//     isOpen,
//     openModal,
//     closeModal,
//     getPayload,
//     setCanBeClosed: modalState.setCanBeClosed,
//   };
// }
