# 🔗 Como Conectar Jarvis ao Evolution API

## Suas Credenciais

✅ **Evolution API URL:** `https://pange-evolution-api.u5qiqp.easypanel.host`
✅ **API Key:** `429683C4C977415CAAFCCE10F7D57E11`
✅ **Database:** Postgres configurado
✅ **Arquivo `.env` atualizado**

## 🚀 Passo a Passo

### 1. Expor o Servidor Local (Desenvolvimento)

Como seu servidor roda em `localhost:3000`, você precisa expô-lo para a internet para o Evolution API alcançar.

**Opção A: ngrok (Recomendado)**

```bash
# Instalar ngrok (se não tiver)
brew install ngrok
# ou
npm install -g ngrok

# Expor porta 3000
ngrok http 3000
```

Você receberá uma URL tipo:
```
https://abc123.ngrok.io
```

**Opção B: localtunnel**

```bash
npx localtunnel --port 3000
```

**Opção C: Cloudflare Tunnel (Produção)**

```bash
cloudflared tunnel --url http://localhost:3000
```

### 2. Rodar o Jarvis

Em outro terminal:

```bash
cd /Users/saraiva/escreveai
npm run dev
```

Você verá:
```
🤖 ================================
🤖   JARVIS BOT INICIANDO...
🤖 ================================

✅ Jarvis inicializado com sucesso!
🚀 Webhook server running on port 3000

✅ Jarvis está online e funcionando!

📡 Endpoints disponíveis:
  🤖 Jarvis Webhook: http://localhost:3000/webhook/jarvis
```

### 3. Configurar Webhook no Evolution API

#### Via API (Método Rápido)

```bash
# Substitua YOUR_NGROK_URL pela URL do ngrok/localtunnel
curl -X POST https://pange-evolution-api.u5qiqp.easypanel.host/webhook/set/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_NGROK_URL/webhook/jarvis",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "MESSAGE_REACTION"
    ]
  }'
```

**Exemplo com ngrok real:**
```bash
curl -X POST https://pange-evolution-api.u5qiqp.easypanel.host/webhook/set/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok.io/webhook/jarvis",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "MESSAGE_REACTION"
    ]
  }'
```

#### Via Interface Web (Se disponível)

1. Acesse: `https://pange-evolution-api.u5qiqp.easypanel.host`
2. Login com API Key
3. Vá em **Webhooks** ou **Instâncias** > **saraiva**
4. Configure:
   - **URL:** `https://YOUR_NGROK_URL/webhook/jarvis`
   - **Events:**
     - ✅ MESSAGES_UPSERT
     - ✅ MESSAGES_UPDATE
     - ✅ MESSAGE_REACTION

### 4. Testar Conexão

#### A. Testar Endpoint Diretamente

```bash
curl -X POST https://YOUR_NGROK_URL/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "hello"}'
```

Deve retornar:
```json
{
  "message": "Teste recebido!",
  "data": {"test": "hello"}
}
```

#### B. Testar no WhatsApp

1. Envie uma mensagem no WhatsApp (em grupo autorizado ou privado)
2. Veja os logs do servidor:

```
📨 Mensagem recebida do WhatsApp
   Evento: messages.upsert
   Instance: saraiva
   Sender: 5511999999999@s.whatsapp.net
   Type: conversation
```

3. Teste um comando:
```
/ping
```

Jarvis deve responder:
```
🏓 Pong! Bot online e funcionando.
```

### 5. Verificar Logs

No terminal onde o Jarvis está rodando, você verá:

**Mensagem recebida e processada:**
```
📨 Mensagem recebida do WhatsApp
   Evento: messages.upsert
   Instance: saraiva
   Sender: 5511991143605@s.whatsapp.net
   Type: conversation

📝 Executando comando: /ping
```

**Reação processada:**
```
📨 Mensagem recebida do WhatsApp
   Evento: messages.upsert
   Instance: saraiva
   Type: reactionMessage

🎯 Reação detectada em 120363404369363372@g.us
🎯 Executando reação: 🔊 -> Transcrever Áudio
```

## 🔧 Configuração Avançada

### Eventos Importantes

Configure estes eventos no webhook:

- ✅ **MESSAGES_UPSERT** - Novas mensagens (obrigatório)
- ✅ **MESSAGE_REACTION** - Reações com emoji (obrigatório)
- ⚪ **MESSAGES_UPDATE** - Atualizações de mensagens
- ⚪ **CONNECTION_UPDATE** - Status da conexão
- ⚪ **PRESENCE_UPDATE** - Online/offline

### Webhook por Eventos

Se quiser webhooks separados por tipo de evento:

```bash
curl -X POST https://pange-evolution-api.u5qiqp.easypanel.host/webhook/set/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://YOUR_NGROK_URL/webhook/jarvis",
    "webhook_by_events": true,
    "events": {
      "MESSAGES_UPSERT": "https://YOUR_NGROK_URL/webhook/jarvis/messages",
      "MESSAGE_REACTION": "https://YOUR_NGROK_URL/webhook/jarvis/reactions"
    }
  }'
```

## 🐛 Troubleshooting

### Webhook não está chamando

**1. Verifique se o webhook está configurado:**
```bash
curl https://pange-evolution-api.u5qiqp.easypanel.host/webhook/find/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

**2. Teste a URL manualmente:**
```bash
curl -X POST https://YOUR_NGROK_URL/webhook/jarvis \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

**3. Verifique logs do Evolution API:**
```bash
# Se tiver acesso SSH ao servidor
docker logs -f evolution-api
```

### Mensagens não chegam

**Verifique whitelist:**
```
# No WhatsApp, no grupo:
/grupos current
```

Se retornar "não autorizado", adicione o grupo:
```
/grupos add <JID> Nome do Grupo
```

### Reações não funcionam

**Certifique-se que:**
1. Evento `MESSAGE_REACTION` está no webhook
2. Feature `reactions: true` no grupo
3. Emoji está correto (🔊 e não 🔉)

### Ngrok expira

Ngrok free expira a cada 2h. Soluções:

**A. Ngrok Pro (pago) - URL fixo**

**B. Cloudflare Tunnel (grátis) - URL fixo**
```bash
cloudflared tunnel --url http://localhost:3000
```

**C. Deploy em servidor (produção)**
- Railway
- Render
- DigitalOcean
- AWS

## 📱 Próximos Passos

1. ✅ Webhook configurado
2. ✅ Jarvis respondendo
3. 🎯 **Autorizar grupos**
   - Use `/grupos current` nos grupos
   - Adicione com `/grupos add <jid> <nome>`

4. 🎯 **Testar comandos**
   - `/ping`
   - `/ajuda`
   - `/escreveai start`

5. 🎯 **Testar reações**
   - Mande áudio
   - Reaja com 🔊
   - Veja transcrição

6. 🎯 **Configurar APIs de IA** (próximo passo)
   - Groq (transcrição)
   - Gemini (IA)

---

**Jarvis está pronto para conectar! 🚀**

Execute:
```bash
# Terminal 1
ngrok http 3000

# Terminal 2
npm run dev

# Terminal 3 (configure webhook)
curl -X POST https://pange-evolution-api.u5qiqp.easypanel.host/webhook/set/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://SUA_URL_NGROK/webhook/jarvis",
    "webhook_by_events": false,
    "events": ["MESSAGES_UPSERT", "MESSAGE_REACTION"]
  }'
```
