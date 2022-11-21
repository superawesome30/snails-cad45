import * as React from "react";
import type { ModalIds } from "types/ModalIds";
import create from "zustand";

type Payloads = Record<string, unknown>;

interface ModalState {
  canBeClosed: boolean;
  open: ModalIds[];
  payloads: Payloads;

  actions: {
    setOpen(id: ModalIds[]): void;
    setCanBeClosed(v: boolean): void;
    setPayloads(payloads: Payloads): void;
  };
}

interface UseModal extends Pick<ModalState, "canBeClosed" | "actions"> {
  isOpen(id: ModalIds): boolean;
  closeModal(id: ModalIds): void;
  openModal<T = unknown>(id: ModalIds, payload?: T): void;
  getPayload<T = unknown>(id: ModalIds): T | null;
}

export const useModalStore = create<ModalState>()((set, get) => ({
  open: [],
  payloads: {},
  canBeClosed: true,

  actions: {
    setPayloads: (payloads) => set({ payloads }),
    setCanBeClosed: (v) => set({ canBeClosed: v }),
    setOpen: (ids) => set({ open: ids }),

    getPayload<T = unknown>(id: ModalIds) {
      const payloads = get().payloads;
      return (payloads[id] ?? null) as T | null;
    },

    isOpen(id: ModalIds) {
      const openModals = get().open;
      return openModals.includes(id);
    },

    openModal<Payload = unknown>(id: ModalIds, payload: Payload) {
      set((state) => {
        return {
          open: [...state.open, id],
          payloads: { ...state.payloads, [id]: payload },
        };
      });
    },

    closeModal(id: ModalIds) {
      set((state) => ({
        open: state.open.filter((openId) => openId !== id),
        payloads: { ...state.payloads, [id]: undefined },
      }));
    },
  },
}));

export const useModalActions = () => useModalStore((state) => state.actions);
export const useModalState = () =>
  useModalStore((state) => ({
    canBeClosed: state.canBeClosed,
    open: state.open,
    payloads: state.payloads,
  }));

export function useModal(): never {
  const modalState = useModalState();
  const actions = useModalActions();

  const canBeClosed = React.useMemo(() => modalState.canBeClosed, [modalState.canBeClosed]);

  const isOpen = React.useCallback(
    (id: ModalIds) => {
      return modalState.open.includes(id);
    },
    [modalState.open],
  );

  const getPayload = React.useCallback(
    <T = unknown>(id: ModalIds) => {
      return (modalState.payloads[id] ?? null) as T | null;
    },
    [modalState.payloads],
  );

  const openModal = React.useCallback(
    <T = unknown>(id: ModalIds, payload?: T) => {
      if (isOpen(id)) return;

      actions.setPayloads({ ...modalState.payloads, [id]: payload });
      actions.setOpen([...modalState.open, id]);
    },
    [isOpen, modalState.open, modalState.payloads], // eslint-disable-line
  );

  const closeModal = (id: ModalIds) => {
    if (!isOpen(id)) return;

    actions.setPayloads({ ...modalState.payloads, [id]: undefined });
    actions.setOpen(modalState.open.filter((v) => v !== id));
  };

  return {
    canBeClosed,

    isOpen,
    openModal,
    closeModal,
    getPayload,
    setCanBeClosed: modalState.setCanBeClosed,
  };
}
