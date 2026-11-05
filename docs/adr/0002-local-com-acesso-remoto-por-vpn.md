---
status: superseded by ADR-0003
---

# Sistema roda localmente, com acesso remoto por VPN ou túnel, em vez de nuvem

Os dados financeiros ficam no servidor local da empresa, e o acesso de fora do escritório passa por VPN ou túnel seguro, com login. Não expomos a aplicação à internet pública nem hospedamos o banco na nuvem. Escolhemos isso por exigência explícita de rodar localmente e para manter os dados sob controle da empresa, aceitando que o acesso remoto depende da conectividade da VPN.
