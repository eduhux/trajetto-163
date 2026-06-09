import { create } from "zustand";

type ModalAtivo = "upgrade" | "publicar-frete" | "avaliar" | null;

interface UIState {
  modalAtivo: ModalAtivo;
  abrirModal: (m: Exclude<ModalAtivo, null>) => void;
  fecharModal: () => void;

  totalNaoLidasChat: number;
  setTotalNaoLidasChat: (n: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  modalAtivo: null,
  abrirModal: (modalAtivo) => set({ modalAtivo }),
  fecharModal: () => set({ modalAtivo: null }),

  totalNaoLidasChat: 0,
  setTotalNaoLidasChat: (totalNaoLidasChat) => set({ totalNaoLidasChat }),
}));
