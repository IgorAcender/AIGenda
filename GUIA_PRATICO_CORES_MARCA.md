# 🚀 GUIA PRÁTICO - CORES E MARCA AGENDE AI

## Como Começar a Usar

### 1️⃣ Acessar o Painel

```
Dashboard → MARKETING → Cores e Marca
```

### 2️⃣ Escolher um Tema

Existem 3 opções:

#### ☀️ Tema Claro (Light) - Padrão
- Fundo branco (#FFFFFF)
- Texto preto (#000000)
- Botão roxo (#505afb)
- Texto botão branco (#FFFFFF)

#### 🌙 Tema Escuro (Dark)
- Fundo cinza escuro (#1f2937)
- Texto branco (#FFFFFF)
- Botão roxo vibrante (#7c3aed)
- Texto botão branco (#FFFFFF)

#### 🎨 Tema Personalizado
Você escolhe cada cor manualmente

### 3️⃣ Se Escolher Personalizado

Para cada campo de cor, você pode:

**Opção A:** Clicar no quadrado de cor
- Abre o seletor nativo do navegador
- Escolha visualmente a cor desejada
- Clique OK para confirmar

**Opção B:** Digitar o valor hex manualmente
- Digite no formato: `#RRGGBB`
- Exemplo: `#FF0000` para vermelho
- Ou `#F00` para versão curta

### 4️⃣ Upload de Imagem (Futuro)

Clique em "Selecionar Imagem" para:
- Adicionar foto principal do site
- Formatos: PNG, JPG
- Tamanho recomendado: até 5MB

### 5️⃣ Ver Preview

Na coluna direita, você vê em tempo real:
- Como ficará o site
- Exemplos de botão com as cores
- Valores hex das cores ativas

### 6️⃣ Salvar

Clique em "Salvar Configurações"

✅ Sucesso = As cores aparecem na landing page pública

---

## Valores de Cor Padrão

### Cores Web Comuns

```
Vermelho:     #FF0000
Verde:        #00FF00
Azul:         #0000FF
Amarelo:      #FFFF00
Roxo:         #800080
Rosa:         #FFC0CB
Laranja:      #FFA500
Cinza:        #808080
Preto:        #000000
Branco:       #FFFFFF
```

### Cores do AGENDE AI

```
Roxo Primário:  #505afb
Roxo Dark:      #7c3aed
Cinza Dark:     #1f2937
Verde:          #22c55e
Vermelho:       #ef4444
```

---

## Exemplos de Combinações

### Estilo Moderno
```
Background: #F3F4F6 (cinza claríssimo)
Text: #111827 (cinza escuro)
Button: #8B5CF6 (roxo)
Button Text: #FFFFFF
```

### Estilo Minimalista
```
Background: #FFFFFF (branco)
Text: #1F2937 (preto suave)
Button: #000000 (preto)
Button Text: #FFFFFF
```

### Estilo Verde (Saúde/Wellness)
```
Background: #F0FDF4 (verde claríssimo)
Text: #065F46 (verde escuro)
Button: #10B981 (verde)
Button Text: #FFFFFF
```

### Estilo Luxo
```
Background: #1F2937 (cinza escuro)
Text: #F3F4F6 (cinza claro)
Button: #FBBF24 (ouro)
Button Text: #000000
```

---

## Dicas de Design

### ✅ O Que Funciona Bem

- Alto contraste entre texto e fundo
- Cores saturadas para botões (chama atenção)
- Máximo 3 cores + branco/preto
- Cores complementares na roda de cores

### ❌ O Que Evitar

- Texto claro em fundo claro (ilegível)
- Cores muito saturadas para texto (cansativo)
- Muitas cores diferentes (poluído)
- Cores sem contraste suficiente

---

## Conversão RGB → HEX

Se você tem uma cor em RGB, aqui como converter:

### Método 1: Ferramenta Online
- Procure por "RGB to HEX converter"
- Cole RGB (255, 0, 0)
- Copie resultado HEX (#FF0000)

### Método 2: Calculadora
Para RGB (R, G, B):
```
HEX = #RR GG BB
Onde RR, GG, BB são valores em hexadecimal (00-FF)

Exemplo: RGB (255, 80, 251)
- 255 em hex = FF
- 80 em hex = 50
- 251 em hex = FB
Resultado: #FF50FB
```

---

## Como a Landing Page Usa as Cores

### Estrutura da Página Pública

```
┌─────────────────────────────────────┐
│  [LOGO]                             │
│                                     │  ← backgroundColor
│  Bem-vindo ao meu estabelecimento  │  ← textColor
│                                     │
│  [Agendar Agora]                   │  ← buttonColorPrimary + buttonTextColor
│  [Imagem Hero]                     │  ← heroImage
│                                     │
│  Sobre nós, Profissionais, etc...  │  ← textColor
│                                     │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### Problema: Cor não salvou
✓ Verifique conexão internet
✓ Tente salvar novamente
✓ Verifique se o formato hex está correto (#RRGGBB)

### Problema: Cor não aparece na landing page
✓ Aguarde alguns segundos (cache do navegador)
✓ Pressione Ctrl+F5 para limpar cache
✓ Verifique se salvou corretamente

### Problema: Cor fica muito clara/escura
✓ Aumente o contraste
✓ Teste combinações diferentes
✓ Use a paleta "Tema Claro" ou "Tema Escuro"

---

## Integração com Outras Seções

As cores se aplicam a:

- ✅ Landing page pública
- ✅ Botões de agendamento
- ✅ Links e elementos interativos
- ✅ Backgrounds e containers

Não se aplicam (ainda):
- ⏳ Menu da dashboard (admin)
- ⏳ Notificações por email
- ⏳ Agendamento de confirmação

---

## API Endpoints (Para Desenvolvedor)

### Buscar Configurações
```bash
GET /api/tenants/branding

Response:
{
  "themeTemplate": "light",
  "backgroundColor": "#FFFFFF",
  "textColor": "#000000",
  "buttonColorPrimary": "#505afb",
  "buttonTextColor": "#FFFFFF",
  "heroImage": null,
  "sectionsConfig": null
}
```

### Salvar Configurações
```bash
PUT /api/tenants/branding

Body:
{
  "themeTemplate": "custom",
  "backgroundColor": "#F3F4F6",
  "textColor": "#111827",
  "buttonColorPrimary": "#8B5CF6",
  "buttonTextColor": "#FFFFFF"
}

Response: 200 OK
```

---

## Checklist de Setup

- [ ] Acessou MARKETING > Cores e Marca?
- [ ] Escolheu um tema ou personalizou cores?
- [ ] Vê o preview atualizando em tempo real?
- [ ] Clicou em "Salvar Configurações"?
- [ ] Recebeu mensagem "Salvo com sucesso"?
- [ ] Acessou a landing page pública?
- [ ] Cores aparecem corretamente?
- [ ] Botão "Agendar" tem as cores certas?

---

## Perguntas Frequentes

**P: Posso usar cores RGB em vez de HEX?**
R: Não, apenas HEX (ex: #FF0000). Use um conversor online.

**P: Qual é o tamanho máximo da imagem hero?**
R: Atualmente não há limite. Recomenda-se < 5MB para performance.

**P: As cores aparecem em mobile?**
R: Sim! As cores se aplicam em todos os dispositivos.

**P: Posso reverter para as cores padrão?**
R: Sim! Escolha "Tema Claro" ou "Tema Escuro" novamente.

**P: Quanto tempo leva para as mudanças aparecerem?**
R: Geralmente instantâneo. Se não aparecer, limpe o cache (Ctrl+F5).

---

**Implementação Completa! 🎉** 

Qualquer dúvida, consulte a documentação técnica em:
- `IMPLEMENTACAO_CORES_MARCA_AGENDE_AI.md`
- `VISUALIZACAO_CORES_MARCA_UI.md`
