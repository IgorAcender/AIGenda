# 🛠️ Comandos Úteis - EasyPanel

Comandos para executar no terminal do EasyPanel após o deploy.

---

## 📊 Verificar Status

### 1. Health Check da API
```bash
curl http://localhost:3001/health
# ou
curl https://api.seu-dominio.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-23T...",
  "database": "connected",
  "redis": "connected"
}
```

---

## 🗄️ Banco de Dados (Prisma)

### 1. Aplicar Migrations
```bash
npx prisma migrate deploy
```

### 2. Forçar Sincronização do Schema
```bash
npx prisma db push
```

### 3. Ver Status das Migrations
```bash
npx prisma migrate status
```

### 4. Resetar Banco (⚠️ CUIDADO - Apaga tudo!)
```bash
npx prisma migrate reset
```

### 5. Abrir Prisma Studio (Visualizador de Dados)
```bash
npx prisma studio
```
> Acesse em: http://localhost:5555

### 6. Ver Dados no PostgreSQL
```bash
# Conectar no banco
psql $DATABASE_URL

# Listar tabelas
\dt

# Ver dados de uma tabela
SELECT * FROM "User" LIMIT 10;

# Sair
\q
```

---

## 🧹 Limpeza e Manutenção

### 1. Limpar Cache do Redis
```bash
redis-cli -u $REDIS_URL FLUSHALL
```

### 2. Ver uso de memória do Redis
```bash
redis-cli -u $REDIS_URL INFO memory
```

### 3. Listar chaves no Redis
```bash
redis-cli -u $REDIS_URL KEYS "*"
```

### 4. Limpar builds antigos do Next.js
```bash
rm -rf .next
```

---

## 📦 Node.js e Dependências

### 1. Ver versão do Node
```bash
node --version
```

### 2. Ver versão do pnpm
```bash
pnpm --version
```

### 3. Reinstalar dependências
```bash
rm -rf node_modules
pnpm install --frozen-lockfile
```

---

## 🔍 Logs e Debug

### 1. Ver logs da API (últimas 100 linhas)
```bash
pm2 logs api --lines 100
# ou
tail -100 /var/log/api.log
```

### 2. Ver logs do Next.js
```bash
pm2 logs web --lines 100
```

### 3. Ver processos rodando
```bash
ps aux | grep node
```

### 4. Ver uso de memória
```bash
free -h
```

### 5. Ver uso de disco
```bash
df -h
```

---

## 🔐 Segurança

### 1. Gerar novo JWT Secret
```bash
openssl rand -base64 64
```

### 2. Verificar variáveis de ambiente
```bash
# API
cat .env | grep JWT_SECRET

# Ou verificar no container
docker exec -it aigenda-api printenv | grep JWT_SECRET
```

---

## 🚀 Restart e Deploy

### 1. Reiniciar API
```bash
pm2 restart api
# ou
docker restart aigenda-api
```

### 2. Reiniciar Frontend
```bash
pm2 restart web
# ou
docker restart aigenda-web
```

### 3. Rebuild completo
```bash
# No EasyPanel, clique em "Rebuild"
# Ou force um novo deploy:
git commit --allow-empty -m "force rebuild"
git push origin main
```

---

## 🧪 Testes em Produção

### 1. Testar rota de criação de usuário
```bash
curl -X POST https://api.seu-dominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Teste"
  }'
```

### 2. Testar login
```bash
curl -X POST https://api.seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

---

## 📈 Performance

### 1. Ver conexões ativas no PostgreSQL
```bash
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### 2. Ver queries lentas
```bash
psql $DATABASE_URL -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
"
```

### 3. Otimizar tabelas
```bash
psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

---

## 🔄 Backup e Restore

### 1. Backup do banco
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Restaurar backup
```bash
psql $DATABASE_URL < backup_20241223_120000.sql
```

### 3. Backup do Redis
```bash
redis-cli -u $REDIS_URL SAVE
```

---

## 🐛 Troubleshooting

### 1. API não conecta no banco
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1;"
```

### 2. Redis não conecta
```bash
# Verificar REDIS_URL
echo $REDIS_URL

# Testar conexão
redis-cli -u $REDIS_URL ping
# Deve retornar: PONG
```

### 3. Build do Next.js falha
```bash
# Limpar cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### 4. Migrations não aplicam
```bash
# Ver status
npx prisma migrate status

# Forçar sync
npx prisma db push --accept-data-loss
```

---

## 📞 Comandos de Emergência

### 1. Parar tudo
```bash
pm2 stop all
# ou
docker-compose down
```

### 2. Reiniciar tudo
```bash
pm2 restart all
# ou
docker-compose restart
```

### 3. Ver se portas estão em uso
```bash
lsof -i :3000  # Next.js
lsof -i :3001  # API
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

---

## 🎯 Checklist Pós-Deploy

```bash
# Execute estes comandos na ordem:

# 1. Verificar health
curl http://localhost:3001/health

# 2. Aplicar migrations
npx prisma migrate deploy

# 3. Ver status
npx prisma migrate status

# 4. Testar Redis
redis-cli -u $REDIS_URL ping

# 5. Ver logs
tail -50 /var/log/api.log

# 6. Acessar aplicação
curl http://localhost:3000
```

---

## 📚 Referências Rápidas

- **Prisma CLI:** https://www.prisma.io/docs/reference/api-reference/command-reference
- **Redis CLI:** https://redis.io/docs/manual/cli/
- **PostgreSQL:** https://www.postgresql.org/docs/current/app-psql.html
- **PM2:** https://pm2.keymetrics.io/docs/usage/quick-start/

---

**💡 Dica:** Salve estes comandos em um arquivo `.txt` para referência rápida no EasyPanel!
