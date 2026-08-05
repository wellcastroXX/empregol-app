# Contas de teste

## Contas reais (backend de produção — `api.empregolstartup.com.br`)

Criadas diretamente no banco com `emailVerified = true`.

| Papel | E-mail                     | Senha           | Detalhes                                               |
| ----- | -------------------------- | --------------- | ------------------------------------------------------ |
| Clube | `saopaulo@empregolapp.com` | `SaoPaulo@2024` | São Paulo Futebol Clube S.A. · CNPJ 61.534.046/0001-34 |

### Como criar nova conta verificada no banco

```bash
# 1. Registrar via API
curl -X POST https://api.empregolstartup.com.br/auth/contractors/register \
  -H "Content-Type: application/json" \
  -d '{"type":"CLUB","email":"...","password":"...","name":"...","phone":"...","cnpj":"..."}'

# 2. Marcar como verificado (rodar no servidor onde docker-compose está):
docker compose exec db psql -U empregol empregol -c \
  "UPDATE users SET \"emailVerified\" = true, status = 'ACTIVE' WHERE email = 'SEU_EMAIL';"
```

---

## Contas mock legadas (sem backend)

> Funcionam apenas com a `MockAuthService` (removida). Mantidas como referência histórica.
> **Senha:** `Empregol123`

| Papel  | E-mail                      |
| ------ | --------------------------- |
| Atleta | `rafael.andrade@email.com`  |
| Atleta | `lucas.pereira@email.com`   |
| Atleta | `gabriel.souza@email.com`   |
| Agente | `marina@agenciafutebol.com` |
| Clube  | `contato@ecvitoria.com.br`  |

## Notas

- A sessão é persistida via `expo-secure-store`. Para deslogar: **Ajustes → Sair da conta**.
- O fluxo real é: **Cadastrar → verificar e-mail (código 6 dígitos) → Login**.
  Para pular a verificação em testes, use o comando SQL acima no banco de produção.
