# 🚀 Evolution Integration - Setup Guide

## Opções de Execução

### **Opção 1: Desenvolvimento Normal (SEM Evolution)**
```bash
pnpm dev
# Usa mock data - rápido para testes
```

### **Opção 2: Com Evolution Integrado (RECOMENDADO)**
```bash
# Subir tudo com Evolution
docker-compose -f docker-compose.evolution.yml up -d

# Verificar status
docker ps | grep evolution

# Parar tudo
docker-compose -f docker-compose.evolution.yml down
```

## Versioning Strategy

| Ambiente | Imagem | Motivo |
|----------|--------|--------|
| **Development** | `atendai/evolution-api:2.3.7` | Versão testada e estável |
| **Production** | `atendai/evolution-api:2.3.7` | SEMPRE usar versão fixa |
| ❌ Nunca | `atendai/evolution-api:latest` | Imprevísivelmente quebra coisas |

## Primeira Execução com Evolution

```bash
# 1. Subir containers
docker-compose -f docker-compose.evolution.yml up -d

# 2. Aguardar inicialização (~60 segundos)
docker-compose -f docker-compose.evolution.yml logs -f

# 3. Verificar saúde dos serviços
curl http://localhost:3001/health        # API
curl http://localhost:8001/health        # Evolution 1
curl http://localhost:8002/health        # Evolution 2
curl http://localhost:8003/health        # Evolution 3

# 4. Acessar aplicação
open http://localhost:3000
```

## Troubleshooting

### Evolution não conecta
```bash
# Ver logs
docker-compose -f docker-compose.evolution.yml logs evolution-1

# Reiniciar
docker-compose -f docker-compose.evolution.yml restart evolution-1
```

### Porta já em uso
```bash
# Achar o processo
lsof -i :8001

# Matar
kill -9 <PID>

# Ou mudar porta no docker-compose.yml
```

### Resetar tudo
```bash
docker-compose -f docker-compose.evolution.yml down -v
docker-compose -f docker-compose.evolution.yml up -d
```

## URLs de Acesso

| Serviço | URL | Porta |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | 3000 |
| **API** | http://localhost:3001 | 3001 |
| **Evolution 1** | http://localhost:8001 | 8001 |
| **Evolution 2** | http://localhost:8002 | 8002 |
| **Evolution 3** | http://localhost:8003 | 8003 |
| **PostgreSQL** | localhost:5432 | 5432 |
| **Redis** | localhost:6379 | 6379 |

## Próximos Passos

1. ✅ Subir Evolution com `docker-compose.evolution.yml`
2. ✅ Fazer login no app
3. ✅ Ir para Marketing → WhatsApp
4. ✅ Clicar em "QR Code"
5. ✅ Escanear com WhatsApp do celular
6. ✅ Teste completo funciona!

## Versão Recomendada

**Última versão testada: `atendai/evolution-api:2.3.7`**

Para verificar versões disponíveis:
```bash
docker search atendai/evolution-api
# ou
curl https://registry.hub.docker.com/v1/repositories/atendai/evolution-api/tags
```
