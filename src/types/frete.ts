import type {
  BaseDocument,
  EstadoUF,
  FirestoreDate,
  StatusFrete,
  Urgencia,
} from "./common";

/** Documento `fretes/{id}`. Anuncio de frete publicado por um cliente. */
export interface FreteDoc extends BaseDocument {
  // Autor
  clienteUid: string;
  clienteNome: string;
  clienteFotoUrl: string | null;

  // Rota
  estadoOrigem: EstadoUF;
  estadoDestino: EstadoUF;
  cidadeOrigem: string;
  cidadeDestino: string;

  // Carga
  descricaoCarga: string;
  pesoKg: number;
  volumeM3: number | null;
  valorFrete: number;
  dataColeta: FirestoreDate;
  observacoes: string | null;
  urgencia: Urgencia;

  // Estado
  status: StatusFrete;

  // Destaque (premium): aparece primeiro nas buscas
  destaque: boolean;

  // Metricas denormalizadas
  visualizacoes: number;
  contatosRecebidos: number;

  // Vinculo apos finalizacao (para avaliacao)
  motoristaUid: string | null;
}

/**
 * Documento `conversas/{id}`. Thread entre um cliente e um motorista,
 * geralmente ancorada em um frete.
 */
export interface ConversaDoc extends BaseDocument {
  freteId: string | null;
  participantes: [string, string]; // [uidA, uidB] ordenados
  // Resumo denormalizado para a lista de conversas
  ultimaMensagem: string;
  ultimaMensagemEm: FirestoreDate;
  // Contador de nao lidas por participante: { [uid]: number }
  naoLidas: Record<string, number>;
  // Metadados de exibicao por participante: { [uid]: { nome, fotoUrl } }
  metaParticipantes: Record<string, { nome: string; fotoUrl: string | null }>;
}

/** Documento `conversas/{id}/mensagens/{id}`. */
export interface MensagemDoc extends BaseDocument {
  conversaId: string;
  autorUid: string;
  texto: string;
  lida: boolean;
}

/** Documento `avaliacoes/{id}`. Avaliacao de um motorista apos um frete. */
export interface AvaliacaoDoc extends BaseDocument {
  freteId: string;
  motoristaUid: string;
  clienteUid: string;
  clienteNome: string;
  nota: 1 | 2 | 3 | 4 | 5;
  comentario: string | null;
}

/** Documento `notificacoes/{id}`. */
export interface NotificacaoDoc extends BaseDocument {
  destinatarioUid: string;
  tipo: "mensagem" | "contato" | "avaliacao" | "sistema" | "assinatura";
  titulo: string;
  corpo: string;
  lida: boolean;
  // Link interno opcional para abrir ao clicar
  href: string | null;
}

/** Documento `banners/{id}`. Banners gerenciaveis pelo admin. */
export interface BannerDoc extends BaseDocument {
  titulo: string;
  imagemUrl: string;
  href: string | null;
  ativo: boolean;
  ordem: number;
}

/** Documento `configuracoes/{chave}`. Config global do sistema. */
export interface ConfiguracaoDoc {
  chave: string;
  valor: unknown;
  atualizadoEm: FirestoreDate;
}
