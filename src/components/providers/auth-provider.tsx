"use client";

import { useEffect, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/stores";
import { buscarMotorista, buscarPerfil } from "@/features/auth/services/auth-service";

/**
 * Observa o estado de autenticacao do Firebase durante toda a vida do app.
 * Mantem o store sincronizado: usuario, perfil e (se motorista) dados profissionais.
 * A sessao persiste automaticamente entre recarregamentos (persistencia local do Firebase).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { setFirebaseUser, setPerfil, setMotorista, setCarregando, reset } =
    useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        reset();
        return;
      }

      setFirebaseUser(user);
      try {
        const perfil = await buscarPerfil(user.uid);
        setPerfil(perfil);
        if (perfil?.tipoConta === "motorista") {
          setMotorista(await buscarMotorista(user.uid));
        } else {
          setMotorista(null);
        }
      } catch {
        setPerfil(null);
        setMotorista(null);
      } finally {
        setCarregando(false);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
