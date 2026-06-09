"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  CadastroClienteInput,
  CadastroMotoristaInput,
} from "@/lib/validations";
import type { EstadoUF, MotoristaDoc, TipoConta, UserDoc } from "@/types";

const googleProvider = new GoogleAuthProvider();

/** Dados minimos para montar o perfil base em users/{uid}. */
interface DadosPerfilBase {
  nomeCompleto: string;
  documento: string;
  telefone: string;
  cidade: string;
  estado: EstadoUF;
  email: string;
  fotoPerfilUrl?: string | null;
}

/** Cria o documento users/{uid}. Usado tanto no cadastro por e-mail quanto no Google. */
async function gravarPerfilBase(
  uid: string,
  tipoConta: TipoConta,
  dados: DadosPerfilBase,
) {
  await setDoc(doc(db, COLLECTIONS.users, uid), {
    uid,
    tipoConta,
    nomeCompleto: dados.nomeCompleto,
    documento: dados.documento,
    telefone: dados.telefone,
    cidade: dados.cidade,
    estado: dados.estado,
    email: dados.email,
    fotoPerfilUrl: dados.fotoPerfilUrl ?? null,
    plano: "gratuito",
    planoExpiraEm: null,
    suspenso: false,
    admin: false,
    totalFretesPublicados: 0,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

/** Cria o documento motoristas/{uid}. */
async function gravarPerfilMotorista(
  uid: string,
  dados: Pick<
    CadastroMotoristaInput,
    "cnhNumero" | "cnhCategoria" | "tipoVeiculo" | "placa" | "capacidadeCargaKg"
  >,
) {
  await setDoc(doc(db, COLLECTIONS.motoristas, uid), {
    uid,
    cnhNumero: dados.cnhNumero,
    cnhFotoUrl: null,
    cnhCategoria: dados.cnhCategoria,
    tipoVeiculo: dados.tipoVeiculo,
    placa: dados.placa,
    capacidadeCargaKg: dados.capacidadeCargaKg,
    rotasPreferidas: [],
    perfilCompleto: false,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    totalFretesRealizados: 0,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

/** Cadastro de CLIENTE por e-mail e senha. */
export async function cadastrarCliente(input: CadastroClienteInput) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.senha,
  );
  await updateProfile(cred.user, { displayName: input.nomeCompleto });
  await gravarPerfilBase(cred.user.uid, "cliente", {
    nomeCompleto: input.nomeCompleto,
    documento: input.documento,
    telefone: input.telefone,
    cidade: input.cidade,
    estado: input.estado,
    email: input.email,
  });
  return cred.user;
}

/** Cadastro de MOTORISTA por e-mail e senha. */
export async function cadastrarMotorista(input: CadastroMotoristaInput) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.senha,
  );
  await updateProfile(cred.user, { displayName: input.nomeCompleto });
  await gravarPerfilBase(cred.user.uid, "motorista", {
    nomeCompleto: input.nomeCompleto,
    documento: input.documento,
    telefone: input.telefone,
    cidade: input.cidade,
    estado: input.estado,
    email: input.email,
  });
  await gravarPerfilMotorista(cred.user.uid, {
    cnhNumero: input.cnhNumero,
    cnhCategoria: input.cnhCategoria,
    tipoVeiculo: input.tipoVeiculo,
    placa: input.placa,
    capacidadeCargaKg: input.capacidadeCargaKg,
  });
  return cred.user;
}

/** Login por e-mail e senha. */
export async function entrarComEmail(email: string, senha: string) {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

/**
 * Login com Google. Retorna o usuario e se ja existe perfil no Firestore.
 * Quando nao existe, o app deve mandar o usuario completar o cadastro.
 */
export async function entrarComGoogle(): Promise<{
  user: FirebaseUser;
  perfilExiste: boolean;
}> {
  const cred = await signInWithPopup(auth, googleProvider);
  const snap = await getDoc(doc(db, COLLECTIONS.users, cred.user.uid));
  return { user: cred.user, perfilExiste: snap.exists() };
}

/** Completa o perfil de um usuario ja autenticado (fluxo Google). */
export async function completarPerfil(
  user: FirebaseUser,
  tipoConta: TipoConta,
  dados: Omit<DadosPerfilBase, "email">,
) {
  await gravarPerfilBase(user.uid, tipoConta, {
    ...dados,
    email: user.email ?? "",
    fotoPerfilUrl: user.photoURL,
  });
}

/** Completa o perfil de MOTORISTA (base + dados profissionais) no fluxo Google. */
export async function completarPerfilMotorista(
  user: FirebaseUser,
  dadosBase: Omit<DadosPerfilBase, "email">,
  dadosProf: Pick<
    CadastroMotoristaInput,
    "cnhNumero" | "cnhCategoria" | "tipoVeiculo" | "placa" | "capacidadeCargaKg"
  >,
) {
  await gravarPerfilBase(user.uid, "motorista", {
    ...dadosBase,
    email: user.email ?? "",
    fotoPerfilUrl: user.photoURL,
  });
  await gravarPerfilMotorista(user.uid, dadosProf);
}

/** Envia e-mail de recuperacao de senha. */
export async function recuperarSenha(email: string) {
  await sendPasswordResetEmail(auth, email);
}

/** Encerra a sessao. */
export async function sair() {
  await signOut(auth);
}

/** Busca o perfil base de um usuario. */
export async function buscarPerfil(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

/** Busca o perfil de motorista. */
export async function buscarMotorista(
  uid: string,
): Promise<MotoristaDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.motoristas, uid));
  return snap.exists() ? (snap.data() as MotoristaDoc) : null;
}

/** Traduz codigos de erro do Firebase Auth para mensagens em PT-BR. */
export function mensagemErroAuth(code: string): string {
  const mapa: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha é muito fraca (mínimo 8 caracteres).",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests":
      "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
    "auth/popup-closed-by-user": "Login com Google cancelado.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  };
  return mapa[code] ?? "Algo deu errado. Tente novamente.";
}
