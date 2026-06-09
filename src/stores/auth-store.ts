import { create } from "zustand";
import type { User as FirebaseUser } from "firebase/auth";
import type { MotoristaDoc, UserDoc } from "@/types";

interface AuthState {
  /** Usuario do Firebase Auth (token/credenciais). null = deslogado. */
  firebaseUser: FirebaseUser | null;
  /** Documento de perfil em users/{uid}. */
  perfil: UserDoc | null;
  /** Documento profissional (somente quando tipoConta === "motorista"). */
  motorista: MotoristaDoc | null;
  /** true ate o primeiro onAuthStateChanged resolver. */
  carregando: boolean;

  setFirebaseUser: (u: FirebaseUser | null) => void;
  setPerfil: (p: UserDoc | null) => void;
  setMotorista: (m: MotoristaDoc | null) => void;
  setCarregando: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  perfil: null,
  motorista: null,
  carregando: true,

  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setPerfil: (perfil) => set({ perfil }),
  setMotorista: (motorista) => set({ motorista }),
  setCarregando: (carregando) => set({ carregando }),
  reset: () =>
    set({
      firebaseUser: null,
      perfil: null,
      motorista: null,
      carregando: false,
    }),
}));
