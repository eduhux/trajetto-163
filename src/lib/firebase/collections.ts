/** Nomes canonicos das collections do Firestore. Fonte unica da verdade. */
export const COLLECTIONS = {
  users: "users",
  motoristas: "motoristas",
  fretes: "fretes",
  assinaturas: "assinaturas",
  conversas: "conversas",
  mensagens: "mensagens", // subcollection de conversas/{id}/mensagens
  avaliacoes: "avaliacoes",
  notificacoes: "notificacoes",
  banners: "banners",
  configuracoes: "configuracoes",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
