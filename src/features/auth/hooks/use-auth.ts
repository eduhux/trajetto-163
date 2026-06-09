"use client";

import { useAuthStore } from "@/stores";

/**
 * Acesso conveniente ao estado de autenticacao.
 * - autenticado: ha um usuario logado
 * - cadastroCompleto: o usuario ja preencheu o perfil (tem documento)
 */
export function useAuth() {
  const { firebaseUser, perfil, motorista, carregando } = useAuthStore();
  return {
    firebaseUser,
    perfil,
    motorista,
    carregando,
    autenticado: !!firebaseUser,
    cadastroCompleto: !!perfil && perfil.documento.length > 0,
  };
}
