---
status: accepted
---

# Stack em TypeScript: Next.js com PostgreSQL gerenciado, instalável como PWA

A aplicação é escrita em TypeScript de ponta a ponta, com Next.js no front-end e nas rotas de servidor, e banco PostgreSQL gerenciado (Supabase ou Neon), conforme a [ADR 0003](0003-banco-unico-na-nuvem-app-web-com-casca-windows.md). O "instalável no Windows" é um PWA, instalado pelo navegador, sem empacotar um executável. Escolhemos isso por manter uma só linguagem entre banco e interface, o que reduz a chance de o modelo de dados e a tela divergirem, e por evitar a manutenção de um instalador. Não usamos Electron porque não precisamos de recursos nativos do Windows na V1.
