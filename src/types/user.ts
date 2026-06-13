import type {
  BaseDocument,
  CategoriaCNH,
  EstadoUF,
  FirestoreDate,
  Plano,
  StatusAssinatura,
  TipoConta,
  TipoVeiculo,
} from "./common";

/**
 * Documento `users/{uid}`. O id e sempre o UID do Firebase Auth.
 * Base comum a clientes e motoristas.
 */
export interface UserDoc extends BaseDocument {
  uid: string;
  tipoConta: TipoConta;
  nomeCompleto: string;
  documento: string; // CPF ou CNPJ (somente digitos)
  telefone: string;
  cidade: string;
  estado: EstadoUF;
  fotoPerfilUrl: string | null;
  email: string;

  plano: Plano;
  // Mantido em users para checagem rapida de gate; a verdade vive em assinaturas.
  planoExpiraEm: FirestoreDate | null;

  // Flags de moderacao
  suspenso: boolean;
  admin: boolean;

  // Metricas denormalizadas (cliente)
  totalFretesPublicados: number;
  // Reputacao do cliente (avaliacoes feitas por carreteiros). Agregadas no servidor.
  avaliacaoMediaCliente?: number;
  totalAvaliacoesCliente?: number;
}

/**
 * Documento `motoristas/{uid}`. Perfil profissional do motorista.
 * Existe em paralelo a `users/{uid}` quando tipoConta === "motorista".
 */
export interface MotoristaDoc extends BaseDocument {
  uid: string;
  // Dados da CNH
  cnhNumero: string;
  cnhFotoUrl: string | null;
  cnhCategoria: CategoriaCNH;
  // Veiculo
  tipoVeiculo: TipoVeiculo;
  placa: string;
  capacidadeCargaKg: number;
  // Operacao
  rotasPreferidas: string[]; // ex.: ["Campo Grande -> Sao Paulo"]
  perfilCompleto: boolean;
  // Reputacao denormalizada (atualizada via avaliacoes)
  avaliacaoMedia: number; // 0 a 5
  totalAvaliacoes: number;
  totalFretesRealizados: number;
}

/** Documento `assinaturas/{id}`. Espelha o estado no Mercado Pago. */
export interface AssinaturaDoc extends BaseDocument {
  uid: string;
  plano: Plano;
  status: StatusAssinatura;
  // Identificadores Mercado Pago
  mpPreapprovalId: string | null;
  mpPlanId: string | null;
  mpPayerId: string | null;
  valor: number;
  // Ciclo
  inicioEm: FirestoreDate | null;
  proximaCobrancaEm: FirestoreDate | null;
  canceladaEm: FirestoreDate | null;
}
