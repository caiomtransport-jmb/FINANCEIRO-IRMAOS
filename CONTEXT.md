# Gestão Financeira — Irmãos Miranda

Sistema local de controle financeiro para uma empresa de transporte de veículos. Centraliza gastos, receitas, títulos a pagar e a receber, frota e projeções.

## Parceiros e frota

**Parceiro**:
Pessoa ou empresa com quem a empresa tem relação financeira. Pode ter um ou mais Papéis e estar Ativo ou Inativo.
_Avoid_: Fornecedor e Cliente como cadastros separados, Contato, Account

**Papel**:
Função que um Parceiro exerce perante a empresa: fornecedor de peças, fornecedor de pneus, prestador de serviço ou cliente.
_Avoid_: Categoria de parceiro, Tipo

**Veículo**:
Ativo da frota, com uma Propriedade (própria, arrendada ou de terceiro). Pode receber Lançamentos de custo.
_Avoid_: Caminhão, Carro, Ativo (quando o termo significa só veículo)

**Propriedade**:
Relação jurídica do Veículo com a empresa: própria, arrendada ou de terceiro.
_Avoid_: Tipo de veículo

## Títulos e movimentações

**Conta a Pagar**:
Título de pagamento devido pela empresa a um Parceiro, com vencimento, valor e Estado.
_Avoid_: Despesa a pagar, Boleto (o boleto é apenas um atributo)

**Conta a Receber**:
Título de recebimento devido à empresa por um Parceiro, com vencimento, valor e Estado.
_Avoid_: Receita a receber, Fatura

**Estado**:
Situação gravada de uma Conta a Pagar ou a Receber: Aberto, Pago/Recebido, Parcialmente Pago ou Cancelado. Vencido não é Estado; é derivado da data de vencimento.
_Avoid_: Status

**Vencido**:
Condição derivada: Conta com Estado Aberto ou Parcialmente Pago cuja data de vencimento já passou.
_Avoid_: Atrasado (como Estado gravado)

**Boleto**:
Atributo opcional de uma Conta a Pagar, com código de barras e vencimento. Cada Conta a Pagar tem no máximo um Boleto.
_Avoid_: Título (quando se quer dizer Conta a Pagar)

**Inadimplência**:
Situação de uma Conta a Receber vencida há mais dias do que o limiar do Cliente.
_Avoid_: Calote, Dívida ruim

**Lançamento**:
Movimentação de dinheiro efetivada em uma Conta Bancária: pagamento ou recebimento, vinculado a uma Categoria e, quando houver, a um Veículo.
_Avoid_: Transação, Movimento

## Dívidas e financiamentos

**Financiamento**:
Contrato com um Parceiro (saldo, taxa, prazo) pago em Parcelas. Cada Parcela gera uma Conta a Pagar.
_Avoid_: Empréstimo (quando o contrato é de financiamento de Veículo)

**Parcela**:
Uma das prestações de um Financiamento ou Dívida, com vencimento e valor.
_Avoid_: Prestação

**Dívida**:
Passivo genérico da empresa, com saldo e Parcelas, que não é um Financiamento.
_Avoid_: Empréstimo genérico

## Contas e plano de contas

**Conta Bancária**:
Conta em que o dinheiro efetivamente circula. Todo Lançamento pertence a uma Conta Bancária. O saldo é calculado a partir dos Lançamentos.
_Avoid_: Caixa, Banco

**Plano de Contas**:
Árvore de Categorias usada para classificar os Lançamentos. Tem três grupos fixos no topo: Receita, Custo e Despesa.
_Avoid_: Centro de custo

**Categoria**:
Nó do Plano de Contas, abaixo de um dos três grupos fixos.
_Avoid_: Tag, Rubrica

**Excluído de relatórios**:
Marca de um Lançamento que o deixa fora de relatórios e projeções sem apagá-lo. Pode ser revertida.
_Avoid_: Excluído, Apagado

## Recorrência e projeção

**Recorrência**:
Regra cadastrada que gera Contas a Pagar ou a Receber periodicamente: valor fixo ou estimado, periodicidade (mensal, trimestral ou anual), dia de vencimento e término opcional.
_Avoid_: Agendamento, Assinatura

**Projeção**:
Estimativa de entradas e saídas dos meses seguintes, formada por títulos com vencimento futuro (compromissos) e Recorrências (previsões).
_Avoid_: Forecast, Previsão (quando se refere ao cálculo inteiro)

## Acesso

**Perfil**:
Papel de um usuário no sistema. Administrador tem acesso total; Operador lança e consulta, mas não exclui nem altera o Plano de Contas.
_Avoid_: Role, Permissão

## Relações

- Um **Parceiro** tem um ou mais **Papéis**.
- Uma **Conta a Pagar** ou **a Receber** pertence a um **Parceiro** e é gerada por uma **Recorrência**, por uma **Parcela** ou lançada manualmente.
- Um **Lançamento** pertence a uma **Conta Bancária**, a uma **Categoria** e, opcionalmente, a um **Veículo**.
- Uma **Categoria** pertence a um dos três grupos fixos do **Plano de Contas**.
- Um **Financiamento** ou **Dívida** tem muitas **Parcelas**; cada Parcela gera uma **Conta a Pagar**.
