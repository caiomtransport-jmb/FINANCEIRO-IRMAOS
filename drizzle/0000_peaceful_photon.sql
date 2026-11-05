CREATE TYPE "public"."estado_titulo" AS ENUM('aberto', 'parcial', 'pago', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."grupo_categoria" AS ENUM('receita', 'custo', 'despesa');--> statement-breakpoint
CREATE TYPE "public"."papel_parceiro" AS ENUM('fornecedor_pecas', 'fornecedor_pneus', 'prestador_servico', 'cliente');--> statement-breakpoint
CREATE TYPE "public"."perfil_usuario" AS ENUM('administrador', 'operador');--> statement-breakpoint
CREATE TYPE "public"."periodicidade" AS ENUM('mensal', 'trimestral', 'anual');--> statement-breakpoint
CREATE TYPE "public"."propriedade_veiculo" AS ENUM('proprio', 'arrendado', 'terceiro');--> statement-breakpoint
CREATE TYPE "public"."status_parceiro" AS ENUM('ativo', 'inativo');--> statement-breakpoint
CREATE TYPE "public"."tipo_contrato" AS ENUM('financiamento', 'divida');--> statement-breakpoint
CREATE TYPE "public"."tipo_lancamento" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TYPE "public"."tipo_titulo" AS ENUM('pagar', 'receber');--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"grupo" "grupo_categoria" NOT NULL,
	"pai_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contas_bancarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"banco" text,
	"agencia" text,
	"numero_conta" text,
	"saldo_inicial" numeric(14, 2) DEFAULT '0' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contratos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_contrato" NOT NULL,
	"parceiro_id" uuid NOT NULL,
	"descricao" text NOT NULL,
	"saldo_devedor" numeric(14, 2) NOT NULL,
	"taxa_juros_mensal" numeric(7, 4),
	"prazo_meses" integer NOT NULL,
	"veiculo_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lancamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conta_bancaria_id" uuid NOT NULL,
	"categoria_id" uuid NOT NULL,
	"titulo_id" uuid,
	"veiculo_id" uuid,
	"tipo" "tipo_lancamento" NOT NULL,
	"descricao" text NOT NULL,
	"valor" numeric(14, 2) NOT NULL,
	"data_competencia" date NOT NULL,
	"data_movimento" date NOT NULL,
	"excluido_de_relatorios" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parceiro_papeis" (
	"parceiro_id" uuid NOT NULL,
	"papel" "papel_parceiro" NOT NULL,
	CONSTRAINT "parceiro_papeis_parceiro_id_papel_pk" PRIMARY KEY("parceiro_id","papel")
);
--> statement-breakpoint
CREATE TABLE "parceiros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"documento" text,
	"status" "status_parceiro" DEFAULT 'ativo' NOT NULL,
	"limiar_inadimplencia_dias" integer DEFAULT 1 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parceiros_documento_unique" UNIQUE("documento")
);
--> statement-breakpoint
CREATE TABLE "parcelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contrato_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"vencimento" date NOT NULL,
	"valor" numeric(14, 2) NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recorrencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"descricao" text NOT NULL,
	"tipo" "tipo_titulo" NOT NULL,
	"parceiro_id" uuid NOT NULL,
	"categoria_id" uuid NOT NULL,
	"valor" numeric(14, 2) NOT NULL,
	"valor_estimado" boolean DEFAULT false NOT NULL,
	"periodicidade" "periodicidade" NOT NULL,
	"dia_vencimento" integer NOT NULL,
	"data_inicio" date NOT NULL,
	"data_termino" date,
	"ativa" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "titulos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_titulo" NOT NULL,
	"parceiro_id" uuid NOT NULL,
	"categoria_id" uuid NOT NULL,
	"veiculo_id" uuid,
	"descricao" text NOT NULL,
	"valor" numeric(14, 2) NOT NULL,
	"data_competencia" date NOT NULL,
	"vencimento" date NOT NULL,
	"estado" "estado_titulo" DEFAULT 'aberto' NOT NULL,
	"boleto_codigo_barras" text,
	"boleto_vencimento" date,
	"recorrencia_id" uuid,
	"parcela_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"perfil" "perfil_usuario" DEFAULT 'operador' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "veiculos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placa" text NOT NULL,
	"descricao" text NOT NULL,
	"propriedade" "propriedade_veiculo" DEFAULT 'proprio' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "veiculos_placa_unique" UNIQUE("placa")
);
--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_pai_id_categorias_id_fk" FOREIGN KEY ("pai_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_parceiro_id_parceiros_id_fk" FOREIGN KEY ("parceiro_id") REFERENCES "public"."parceiros"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_conta_bancaria_id_contas_bancarias_id_fk" FOREIGN KEY ("conta_bancaria_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_titulo_id_titulos_id_fk" FOREIGN KEY ("titulo_id") REFERENCES "public"."titulos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parceiro_papeis" ADD CONSTRAINT "parceiro_papeis_parceiro_id_parceiros_id_fk" FOREIGN KEY ("parceiro_id") REFERENCES "public"."parceiros"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_parceiro_id_parceiros_id_fk" FOREIGN KEY ("parceiro_id") REFERENCES "public"."parceiros"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_parceiro_id_parceiros_id_fk" FOREIGN KEY ("parceiro_id") REFERENCES "public"."parceiros"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_recorrencia_id_recorrencias_id_fk" FOREIGN KEY ("recorrencia_id") REFERENCES "public"."recorrencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_parcela_id_parcelas_id_fk" FOREIGN KEY ("parcela_id") REFERENCES "public"."parcelas"("id") ON DELETE restrict ON UPDATE no action;