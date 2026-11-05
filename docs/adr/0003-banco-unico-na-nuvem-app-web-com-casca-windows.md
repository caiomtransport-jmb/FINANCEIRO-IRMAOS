---
status: accepted
---

# Banco único na nuvem como fonte de verdade, com aplicação web e instalador Windows

O sistema é uma aplicação web, com um instalador Windows que apenas abre essa mesma aplicação. Os dados ficam em um banco único hospedado na nuvem, que é a fonte de verdade para todos os usuários, inclusive o acesso remoto. Escolhemos isso em vez de um banco local com sincronização, porque sincronizar edições concorrentes nos dois sentidos é a parte mais cara de construir e manter, e o uso remoto por operadores exige dados em tempo real. Isso substitui a [ADR 0002](0002-local-com-acesso-remoto-por-vpn.md) e aceita que o sistema depende de internet para funcionar.
