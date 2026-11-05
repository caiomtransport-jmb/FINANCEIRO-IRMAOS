CREATE TABLE "parceiro_papeis" (
	"parceiro_id" uuid NOT NULL,
	"papel_id" uuid NOT NULL,
	CONSTRAINT "parceiro_papeis_parceiro_id_papel_id_pk" PRIMARY KEY("parceiro_id","papel_id")
);
--> statement-breakpoint
ALTER TABLE "parceiro_papeis" ADD CONSTRAINT "parceiro_papeis_parceiro_id_parceiros_id_fk" FOREIGN KEY ("parceiro_id") REFERENCES "public"."parceiros"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parceiro_papeis" ADD CONSTRAINT "parceiro_papeis_papel_id_papeis_id_fk" FOREIGN KEY ("papel_id") REFERENCES "public"."papeis"("id") ON DELETE restrict ON UPDATE no action;