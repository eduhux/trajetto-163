/**
 * Firebase Admin - SDK do servidor (apenas em rotas/API, NUNCA no cliente).
 * Inicializacao "preguicosa": so liga quando uma rota realmente usa, evitando
 * quebrar o build quando as credenciais nao estao presentes.
 */
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function buildAdminApp(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // A private_key vem com \n escapados nas env vars; revertemos para quebras reais.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Credenciais do Firebase Admin ausentes. Verifique as variaveis FIREBASE_ADMIN_*.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(buildAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(buildAdminApp());
}
