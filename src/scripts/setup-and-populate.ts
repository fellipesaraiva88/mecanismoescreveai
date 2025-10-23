/**
 * 🚀 SCRIPT DE SETUP E POPULAÇÃO INICIAL
 * Configura o database e popula com dados de exemplo
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
import { getMessageProcessor } from '../features/analytics/core/message-processor.js'
import { getSentimentAnalyzer } from '../features/analytics/sentiment/sentiment-analyzer.js'
import { getPatternDetector } from '../features/analytics/metrics/pattern-detector.js'
import { getRelationshipBuilder } from '../features/analytics/relationships/relationship-builder.js'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:senha@localhost:5432/whatsapp_analytics',
})

// ============================================
// DADOS DE EXEMPLO (Mock Data)
// ============================================

const mockParticipants = [
  { jid: '5511999999991@s.whatsapp.net', name: 'João Silva', phone: '5511999999991' },
  { jid: '5511999999992@s.whatsapp.net', name: 'Maria Santos', phone: '5511999999992' },
  { jid: '5511999999993@s.whatsapp.net', name: 'Pedro Costa', phone: '5511999999993' },
  { jid: '5511999999994@s.whatsapp.net', name: 'Ana Lima', phone: '5511999999994' },
  { jid: '5511999999995@s.whatsapp.net', name: 'Carlos Souza', phone: '5511999999995' },
  { jid: '5511999999996@s.whatsapp.net', name: 'Beatriz Alves', phone: '5511999999996' },
  { jid: '5511999999997@s.whatsapp.net', name: 'Rafael Mendes', phone: '5511999999997' },
  { jid: '5511999999998@s.whatsapp.net', name: 'Juliana Rocha', phone: '5511999999998' },
]

const mockGroups = [
  { jid: '120363123456789@g.us', name: 'Equipe de Trabalho', type: 'group' as const },
  { jid: '120363123456790@g.us', name: 'Família', type: 'group' as const },
  { jid: '120363123456791@g.us', name: 'Amigos', type: 'group' as const },
]

const mockMessages = [
  // Mensagens positivas
  { sender: 0, content: 'Bom dia pessoal! Como estão? 😊', sentiment: 0.8, group: 0 },
  { sender: 1, content: 'Ótimo! Muito animada com o projeto novo! 🎉', sentiment: 0.9, group: 0 },
  { sender: 2, content: 'Pessoal, conseguimos bater a meta! Parabéns a todos! 🎊', sentiment: 0.95, group: 0 },
  { sender: 3, content: 'Adorei a reunião de hoje, muito produtiva!', sentiment: 0.85, group: 0 },

  // Mensagens neutras
  { sender: 4, content: 'Alguém tem o relatório de ontem?', sentiment: 0.1, group: 0 },
  { sender: 5, content: 'Vou enviar o documento agora.', sentiment: 0.0, group: 0 },
  { sender: 6, content: 'Reunião confirmada para as 14h', sentiment: 0.05, group: 0 },
  { sender: 7, content: 'Recebi, obrigada!', sentiment: 0.3, group: 0 },

  // Mensagens negativas
  { sender: 0, content: 'Estou preocupado com o prazo... 😟', sentiment: -0.6, group: 0 },
  { sender: 1, content: 'Acho que não vai dar tempo de terminar tudo', sentiment: -0.5, group: 0 },
  { sender: 2, content: 'Precisamos de mais recursos para isso', sentiment: -0.3, group: 0 },

  // Grupo Família
  { sender: 0, content: 'Oi família! Tudo bem com vocês? ❤️', sentiment: 0.8, group: 1 },
  { sender: 1, content: 'Tudo ótimo! Vamos marcar um almoço?', sentiment: 0.7, group: 1 },
  { sender: 3, content: 'Adorei a ideia! Domingo que vem?', sentiment: 0.85, group: 1 },
  { sender: 4, content: 'Pode ser! Vou levar a sobremesa 🍰', sentiment: 0.9, group: 1 },

  // Grupo Amigos
  { sender: 2, content: 'E aí galera, partiu futebol sábado? ⚽', sentiment: 0.75, group: 2 },
  { sender: 5, content: 'Bora! Que horas?', sentiment: 0.6, group: 2 },
  { sender: 6, content: 'Eu vou! 16h tá bom?', sentiment: 0.7, group: 2 },
  { sender: 7, content: 'Fechado! Já estou animado! 🔥', sentiment: 0.95, group: 2 },

  // Mais mensagens para variedade
  { sender: 1, content: 'Pessoal, preciso de ajuda com uma tarefa', sentiment: -0.2, group: 0 },
  { sender: 3, content: 'Claro! No que você precisa?', sentiment: 0.6, group: 0 },
  { sender: 0, content: 'Obrigada Maria! Vou te chamar no privado', sentiment: 0.7, group: 0 },
  { sender: 4, content: 'Alguém sabe quando sai o pagamento?', sentiment: -0.1, group: 0 },
  { sender: 5, content: 'Normalmente sai dia 5', sentiment: 0.0, group: 0 },

  // Mensagens com emojis variados
  { sender: 6, content: 'Acabei de fechar um contrato grande! 💰🎉', sentiment: 1.0, group: 0 },
  { sender: 7, content: 'Parabéns Rafael! Você merece! 👏👏👏', sentiment: 0.95, group: 0 },
  { sender: 0, content: 'Isso sim! Vamos comemorar! 🍾', sentiment: 0.9, group: 0 },

  // Mensagens técnicas/profissionais
  { sender: 2, content: 'Deploy realizado com sucesso em produção', sentiment: 0.5, group: 0 },
  { sender: 3, content: 'Ótimo! Vou validar os testes', sentiment: 0.4, group: 0 },
  { sender: 4, content: 'Todos os testes passaram ✅', sentiment: 0.8, group: 0 },
]

// ============================================
// FUNÇÕES DE POPULAÇÃO
// ============================================

async function setupDatabase() {
  console.log('\n🗄️  Verificando database...')

  try {
    await pool.query('SELECT 1')
    console.log('✅ Database conectado com sucesso!')
  } catch (error: any) {
    console.error('❌ Erro ao conectar no database:', error.message)
    console.log('\n💡 Dica: Certifique-se de que o PostgreSQL está rodando e o DATABASE_URL está correto')
    process.exit(1)
  }
}

async function clearExistingData() {
  console.log('\n🧹 Limpando dados existentes...')

  try {
    // Ordem é importante por causa das foreign keys
    await pool.query('TRUNCATE TABLE message_sentiment CASCADE')
    await pool.query('TRUNCATE TABLE message_topics CASCADE')
    await pool.query('TRUNCATE TABLE behavior_patterns CASCADE')
    await pool.query('TRUNCATE TABLE participant_relationships CASCADE')
    await pool.query('TRUNCATE TABLE ai_insights CASCADE')
    await pool.query('TRUNCATE TABLE alerts CASCADE')
    await pool.query('TRUNCATE TABLE messages CASCADE')
    await pool.query('TRUNCATE TABLE participants CASCADE')
    await pool.query('TRUNCATE TABLE conversations CASCADE')

    console.log('✅ Dados limpos!')
  } catch (error: any) {
    console.log('⚠️  Aviso ao limpar dados:', error.message)
  }
}

async function populateParticipants() {
  console.log('\n👥 Criando participantes...')

  for (const participant of mockParticipants) {
    await pool.query(
      `INSERT INTO participants (jid, name, phone, instance, message_count)
       VALUES ($1, $2, $3, 'saraiva', 0)
       ON CONFLICT (jid) DO NOTHING`,
      [participant.jid, participant.name, participant.phone]
    )
  }

  console.log(`✅ ${mockParticipants.length} participantes criados!`)
}

async function populateConversations() {
  console.log('\n💬 Criando conversas...')

  for (const group of mockGroups) {
    await pool.query(
      `INSERT INTO conversations (jid, name, type, instance, participant_count)
       VALUES ($1, $2, $3, 'saraiva', ${mockParticipants.length})
       ON CONFLICT (jid) DO NOTHING`,
      [group.jid, group.name, group.type]
    )
  }

  console.log(`✅ ${mockGroups.length} conversas criadas!`)
}

async function populateMessages() {
  console.log('\n📨 Criando mensagens...')

  const now = Date.now()
  let messageCount = 0

  for (let i = 0; i < mockMessages.length; i++) {
    const msg = mockMessages[i]
    const participant = mockParticipants[msg.sender]
    const group = mockGroups[msg.group]

    // Distribui mensagens ao longo dos últimos 7 dias
    const daysAgo = Math.floor(Math.random() * 7)
    const hoursAgo = Math.floor(Math.random() * 24)
    const timestamp = Math.floor((now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000)) / 1000)

    const messageId = `msg_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`

    try {
      await pool.query(
        `INSERT INTO messages (
          message_id, instance, conversation_jid, sender_jid, sender_name,
          message_type, content, timestamp, is_from_me
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          messageId,
          'saraiva',
          group.jid,
          participant.jid,
          participant.name,
          'conversation',
          msg.content,
          timestamp,
          false
        ]
      )

      // Atualizar contador de mensagens do participante
      await pool.query(
        `UPDATE participants SET message_count = message_count + 1, last_seen_at = NOW()
         WHERE jid = $1`,
        [participant.jid]
      )

      // Atualizar contador da conversa
      await pool.query(
        `UPDATE conversations SET message_count = message_count + 1, last_message_at = NOW()
         WHERE jid = $1`,
        [group.jid]
      )

      messageCount++
    } catch (error: any) {
      console.error('Erro ao criar mensagem:', error.message)
    }
  }

  console.log(`✅ ${messageCount} mensagens criadas!`)
}

async function analyzeSentiments() {
  console.log('\n🎭 Analisando sentimentos (simulado)...')

  const messages = await pool.query('SELECT message_id, content FROM messages WHERE content IS NOT NULL')

  for (const row of messages.rows) {
    // Calcula sentimento baseado em palavras-chave (simplificado)
    let score = 0
    const content = row.content.toLowerCase()

    // Positivo
    if (content.match(/ótimo|bom|feliz|adorei|parabéns|sucesso|animad|🎉|😊|❤️|✅|👏/)) score += 0.7
    if (content.match(/muito|super|demais|excelente|maravilhoso/)) score += 0.3

    // Negativo
    if (content.match(/preocupado|problema|ruim|não|difícil|😟|❌/)) score -= 0.6
    if (content.match(/impossível|terrível|horrível|péssimo/)) score -= 0.4

    score = Math.max(-1, Math.min(1, score))

    const label = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral'

    await pool.query(
      `INSERT INTO message_sentiment (
        message_id, sentiment_label, sentiment_score, emotions, confidence, model_used
      ) VALUES ($1, $2, $3, $4, $5, 'mock')
      ON CONFLICT (message_id) DO NOTHING`,
      [
        row.message_id,
        label,
        score,
        JSON.stringify({
          joy: score > 0 ? score : 0,
          sadness: score < 0 ? -score * 0.5 : 0,
          anger: score < -0.5 ? -score * 0.3 : 0,
          fear: 0,
          surprise: Math.abs(score) > 0.7 ? 0.3 : 0,
          disgust: 0,
        }),
        0.75,
      ]
    )
  }

  console.log(`✅ ${messages.rows.length} análises de sentimento criadas!`)
}

async function createRelationships() {
  console.log('\n🕸️  Criando relacionamentos...')

  // Cria relacionamentos entre alguns participantes
  const relationships = [
    [0, 1, 0.9], // João e Maria
    [0, 3, 0.75], // João e Ana
    [1, 2, 0.65], // Maria e Pedro
    [2, 5, 0.55], // Pedro e Beatriz
    [4, 6, 0.7], // Carlos e Rafael
    [3, 7, 0.8], // Ana e Juliana
  ]

  for (const [a, b, strength] of relationships) {
    const jidA = mockParticipants[a].jid
    const jidB = mockParticipants[b].jid

    // Garantir ordem consistente (A < B)
    const [participantA, participantB] = jidA < jidB ? [jidA, jidB] : [jidB, jidA]

    await pool.query(
      `INSERT INTO participant_relationships (
        participant_a_jid, participant_b_jid, relationship_strength, total_interactions
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (participant_a_jid, participant_b_jid) DO NOTHING`,
      [participantA, participantB, strength, Math.floor(Math.random() * 50) + 10]
    )
  }

  console.log(`✅ ${relationships.length} relacionamentos criados!`)
}

async function createInsights() {
  console.log('\n💡 Criando insights de exemplo...')

  const insights = [
    {
      type: 'pattern',
      title: 'Horário de pico identificado',
      description: 'A equipe está mais ativa entre 14h e 16h, com 45% das mensagens neste período',
      severity: 'info',
    },
    {
      type: 'trend',
      title: 'Sentimento geral positivo',
      description: 'O sentimento da equipe está 35% mais positivo esta semana comparado à semana passada',
      severity: 'info',
    },
    {
      type: 'anomaly',
      title: 'Mudança de comportamento detectada',
      description: 'João Silva reduziu sua participação em 60% nos últimos 3 dias',
      severity: 'warning',
    },
    {
      type: 'recommendation',
      title: 'Oportunidade de engajamento',
      description: 'Maria Santos e Pedro Costa têm alta afinidade. Considere incluí-los no mesmo projeto',
      severity: 'info',
    },
  ]

  for (const insight of insights) {
    await pool.query(
      `INSERT INTO ai_insights (
        insight_type, subject_type, title, description, severity, confidence, supporting_data
      ) VALUES ($1, 'global', $2, $3, $4, 0.85, '{}')`,
      [insight.type, insight.title, insight.description, insight.severity]
    )
  }

  console.log(`✅ ${insights.length} insights criados!`)
}

async function createAlerts() {
  console.log('\n🚨 Criando alertas de exemplo...')

  const alerts = [
    {
      type: 'sentiment_threshold',
      title: 'Sentimento negativo detectado',
      message: 'Foram detectadas mensagens com sentimento muito negativo no grupo Equipe de Trabalho',
      severity: 'warning',
    },
    {
      type: 'behavior_change',
      title: 'Queda de atividade',
      message: 'João Silva está menos ativo que o normal nos últimos dias',
      severity: 'info',
    },
  ]

  for (const alert of alerts) {
    await pool.query(
      `INSERT INTO alerts (
        alert_type, title, message, severity, metadata
      ) VALUES ($1, $2, $3, $4, '{}')`,
      [alert.type, alert.title, alert.message, alert.severity]
    )
  }

  console.log(`✅ ${alerts.length} alertas criados!`)
}

async function showStatistics() {
  console.log('\n📊 Estatísticas do Sistema:')
  console.log('━'.repeat(50))

  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM participants) as participants,
      (SELECT COUNT(*) FROM conversations) as conversations,
      (SELECT COUNT(*) FROM messages) as messages,
      (SELECT COUNT(*) FROM message_sentiment) as sentiments,
      (SELECT COUNT(*) FROM participant_relationships) as relationships,
      (SELECT COUNT(*) FROM ai_insights) as insights,
      (SELECT COUNT(*) FROM alerts) as alerts
  `)

  const data = stats.rows[0]

  console.log(`👥 Participantes:    ${data.participants}`)
  console.log(`💬 Conversas:        ${data.conversations}`)
  console.log(`📨 Mensagens:        ${data.messages}`)
  console.log(`🎭 Análises:         ${data.sentiments}`)
  console.log(`🕸️  Relacionamentos: ${data.relationships}`)
  console.log(`💡 Insights:         ${data.insights}`)
  console.log(`🚨 Alertas:          ${data.alerts}`)
  console.log('━'.repeat(50))
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Setup e População do Sistema Analytics          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `)

  try {
    await setupDatabase()
    await clearExistingData()
    await populateParticipants()
    await populateConversations()
    await populateMessages()
    await analyzeSentiments()
    await createRelationships()
    await createInsights()
    await createAlerts()
    await showStatistics()

    console.log('\n✅ Setup concluído com sucesso!')
    console.log('\n🎯 Próximos passos:')
    console.log('   1. Inicie o backend: npm run dev')
    console.log('   2. Inicie o frontend: cd frontend && npm run dev')
    console.log('   3. Acesse: http://localhost:3001')
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
