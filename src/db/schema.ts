import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------- Enums (termos do CONTEXT.md) ----------

export const statusParceiro = pgEnum("status_parceiro", ["ativo", "inativo"]);
export const papelParceiro = pgEnum("papel_parceiro", [
  "fornecedor_pecas",
  "fornecedor_pneus",
  "prestador_servico",
  "cliente",
]);
export const grupoCategoria = pgEnum("grupo_categoria", ["receita", "custo", "despesa"]);
export const propriedadeVeiculo = pgEnum("propriedade_veiculo", [
  "proprio",
  "arrendado",
  "terceiro",
]);
export const tipoTitulo = pgEnum("tipo_titulo", ["pagar", "receber"]);
// Vencido NÃO é estado gravado: é derivado de vencimento (Q13).
export const estadoTitulo = pgEnum("estado_titulo", [
  "aberto",
  "parcial",
  "pago",
  "cancelado",
]);
export const tipoLancamento = pgEnum("tipo_lancamento", ["entrada", "saida"]);
export const periodicidade = pgEnum("periodicidade", ["mensal", "trimestral", "anual"]);
export const tipoContrato = pgEnum("tipo_contrato", ["financiamento", "divida"]);
export const perfilUsuario = pgEnum("perfil_usuario", ["administrador", "operador"]);

// Colunas de auditoria comuns. Nada é apagado de verdade no financeiro (ver Q8).
const timestamps = {
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).defaultNow().notNull(),
};

const valor = (nome: string) => numeric(nome, { precision: 14, scale: 2 });

// ---------- Acesso ----------

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  perfil: perfilUsuario("perfil").notNull().default("operador"),
  ...timestamps,
});

// ---------- Parceiros e frota ----------

export const parceiros = pgTable("parceiros", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  documento: text("documento").unique(), // CPF ou CNPJ, opcional
  status: statusParceiro("status").notNull().default("ativo"),
  // Limiar de inadimplência por cliente, em dias de atraso (Q7, padrão 1).
  limiarInadimplenciaDias: integer("limiar_inadimplencia_dias").notNull().default(1),
  ...timestamps,
});

// Um parceiro pode ter vários papéis (Q3).
export const parceiroPapeis = pgTable(
  "parceiro_papeis",
  {
    parceiroId: uuid("parceiro_id")
      .notNull()
      .references(() => parceiros.id, { onDelete: "restrict" }),
    papel: papelParceiro("papel").notNull(),
  },
  (t) => [primaryKey({ columns: [t.parceiroId, t.papel] })]
);

export const veiculos = pgTable("veiculos", {
  id: uuid("id").primaryKey().defaultRandom(),
  placa: text("placa").notNull().unique(),
  descricao: text("descricao").notNull(),
  propriedade: propriedadeVeiculo("propriedade").notNull().default("proprio"),
  ...timestamps,
});

// ---------- Contas bancárias e plano de contas ----------

export const contasBancarias = pgTable("contas_bancarias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  banco: text("banco"),
  agencia: text("agencia"),
  numeroConta: text("numero_conta"),
  saldoInicial: valor("saldo_inicial").notNull().default("0"),
  ...timestamps,
});

// Árvore do plano de contas (Q10). `grupo` é herdado do nó de topo e
// gravado em cada linha para permitir somas por grupo sem recursão.
export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  grupo: grupoCategoria("grupo").notNull(),
  paiId: uuid("pai_id").references((): any => categorias.id, { onDelete: "restrict" }),
  ...timestamps,
});

// ---------- Títulos (Contas a Pagar e a Receber) ----------

export const titulos = pgTable("titulos", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: tipoTitulo("tipo").notNull(),
  parceiroId: uuid("parceiro_id")
    .notNull()
    .references(() => parceiros.id, { onDelete: "restrict" }),
  categoriaId: uuid("categoria_id")
    .notNull()
    .references(() => categorias.id, { onDelete: "restrict" }),
  veiculoId: uuid("veiculo_id").references(() => veiculos.id, { onDelete: "restrict" }),
  descricao: text("descricao").notNull(),
  valor: valor("valor").notNull(),
  dataCompetencia: date("data_competencia").notNull(), // regime de competência (ADR 0001)
  vencimento: date("vencimento").notNull(),
  estado: estadoTitulo("estado").notNull().default("aberto"),
  // Boleto é atributo opcional, no máximo um por título (Q11).
  boletoCodigoBarras: text("boleto_codigo_barras"),
  boletoVencimento: date("boleto_vencimento"),
  // Vínculo com a origem, quando houver.
  recorrenciaId: uuid("recorrencia_id").references((): any => recorrencias.id, {
    onDelete: "restrict",
  }),
  parcelaId: uuid("parcela_id").references((): any => parcelas.id, { onDelete: "restrict" }),
  ...timestamps,
});

// ---------- Recorrências (Q17) ----------

export const recorrencias = pgTable("recorrencias", {
  id: uuid("id").primaryKey().defaultRandom(),
  descricao: text("descricao").notNull(),
  tipo: tipoTitulo("tipo").notNull(),
  parceiroId: uuid("parceiro_id")
    .notNull()
    .references(() => parceiros.id, { onDelete: "restrict" }),
  categoriaId: uuid("categoria_id")
    .notNull()
    .references(() => categorias.id, { onDelete: "restrict" }),
  valor: valor("valor").notNull(),
  valorEstimado: boolean("valor_estimado").notNull().default(false),
  periodicidade: periodicidade("periodicidade").notNull(),
  diaVencimento: integer("dia_vencimento").notNull(), // 1 a 31
  dataInicio: date("data_inicio").notNull(),
  dataTermino: date("data_termino"), // opcional
  ativa: boolean("ativa").notNull().default(true),
  ...timestamps,
});

// ---------- Financiamentos e dívidas (Q6) ----------

export const contratos = pgTable("contratos", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: tipoContrato("tipo").notNull(),
  parceiroId: uuid("parceiro_id")
    .notNull()
    .references(() => parceiros.id, { onDelete: "restrict" }),
  descricao: text("descricao").notNull(),
  saldoDevedor: valor("saldo_devedor").notNull(),
  taxaJurosMensal: numeric("taxa_juros_mensal", { precision: 7, scale: 4 }),
  prazoMeses: integer("prazo_meses").notNull(),
  veiculoId: uuid("veiculo_id").references(() => veiculos.id, { onDelete: "restrict" }),
  ...timestamps,
});

export const parcelas = pgTable("parcelas", {
  id: uuid("id").primaryKey().defaultRandom(),
  contratoId: uuid("contrato_id")
    .notNull()
    .references(() => contratos.id, { onDelete: "restrict" }),
  numero: integer("numero").notNull(),
  vencimento: date("vencimento").notNull(),
  valor: valor("valor").notNull(),
  ...timestamps,
});

// ---------- Lançamentos (movimentações efetivadas) ----------

export const lancamentos = pgTable("lancamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  contaBancariaId: uuid("conta_bancaria_id")
    .notNull()
    .references(() => contasBancarias.id, { onDelete: "restrict" }),
  categoriaId: uuid("categoria_id")
    .notNull()
    .references(() => categorias.id, { onDelete: "restrict" }),
  tituloId: uuid("titulo_id").references(() => titulos.id, { onDelete: "restrict" }),
  veiculoId: uuid("veiculo_id").references(() => veiculos.id, { onDelete: "restrict" }),
  tipo: tipoLancamento("tipo").notNull(),
  descricao: text("descricao").notNull(),
  valor: valor("valor").notNull(),
  dataCompetencia: date("data_competencia").notNull(), // DRE (ADR 0001)
  dataMovimento: date("data_movimento").notNull(), // Fluxo de caixa (ADR 0001)
  // "Excluir custo" = fora de relatórios, reversível; nunca apaga (Q8).
  excluidoDeRelatorios: boolean("excluido_de_relatorios").notNull().default(false),
  ...timestamps,
});
