import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ms(v: unknown): number {
  if (v && typeof (v as { toMillis?: () => number }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  if (typeof v === "number") return v;
  return 0;
}

/** Verifica o token e confirma que o usuário é admin (campo no doc). */
async function exigirAdmin(
  req: NextRequest,
): Promise<{ uid: string } | NextResponse> {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!idToken) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }
  const { uid } = await getAdminAuth().verifyIdToken(idToken);
  const snap = await getAdminDb().collection(COLLECTIONS.users).doc(uid).get();
  if (!snap.exists || snap.data()!.admin !== true) {
    return NextResponse.json({ erro: "Acesso restrito." }, { status: 403 });
  }
  return { uid };
}

/** Dados para o painel: fretes e usuários recentes. */
export async function GET(req: NextRequest) {
  try {
    const auth = await exigirAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const db = getAdminDb();
    const [fretesSnap, usersSnap] = await Promise.all([
      db.collection(COLLECTIONS.fretes).orderBy("criadoEm", "desc").limit(60).get(),
      db.collection(COLLECTIONS.users).orderBy("criadoEm", "desc").limit(60).get(),
    ]);

    const fretes = fretesSnap.docs.map((d) => {
      const f = d.data();
      return {
        id: d.id,
        clienteNome: f.clienteNome ?? "Cliente",
        descricaoCarga: f.descricaoCarga ?? "",
        cidadeOrigem: f.cidadeOrigem ?? "",
        estadoOrigem: f.estadoOrigem ?? "",
        cidadeDestino: f.cidadeDestino ?? "",
        estadoDestino: f.estadoDestino ?? "",
        valorFrete: f.valorFrete ?? 0,
        status: f.status ?? "ativo",
        criadoEm: ms(f.criadoEm),
      };
    });

    const usuarios = usersSnap.docs.map((d) => {
      const u = d.data();
      return {
        uid: d.id,
        nomeCompleto: u.nomeCompleto ?? "Usuário",
        email: u.email ?? "",
        tipoConta: u.tipoConta ?? "cliente",
        plano: u.plano ?? "gratuito",
        cidade: u.cidade ?? "",
        estado: u.estado ?? "",
        suspenso: u.suspenso === true,
        admin: u.admin === true,
        criadoEm: ms(u.criadoEm),
      };
    });

    return NextResponse.json({ fretes, usuarios });
  } catch (e) {
    console.error("Erro admin GET:", e);
    return NextResponse.json({ erro: "Falha ao carregar." }, { status: 500 });
  }
}

/** Ações de moderação. */
export async function POST(req: NextRequest) {
  try {
    const auth = await exigirAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const body = (await req.json()) as { tipo?: string; id?: string };
    const { tipo, id } = body;
    if (!tipo || !id) {
      return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
    }

    const db = getAdminDb();
    const carimbo = { atualizadoEm: FieldValue.serverTimestamp() };

    switch (tipo) {
      case "frete_cancelar":
        await db.collection(COLLECTIONS.fretes).doc(id).update({ status: "cancelado", ...carimbo });
        break;
      case "frete_reativar":
        await db.collection(COLLECTIONS.fretes).doc(id).update({ status: "ativo", ...carimbo });
        break;
      case "user_suspender":
        if (id === auth.uid) {
          return NextResponse.json({ erro: "Você não pode suspender a si mesmo." }, { status: 400 });
        }
        await db.collection(COLLECTIONS.users).doc(id).update({ suspenso: true, ...carimbo });
        break;
      case "user_reativar":
        await db.collection(COLLECTIONS.users).doc(id).update({ suspenso: false, ...carimbo });
        break;
      default:
        return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro admin POST:", e);
    return NextResponse.json({ erro: "Falha ao executar a ação." }, { status: 500 });
  }
}
