-- Schema para Análise Comportamental de Conversas
-- Database: PostgreSQL

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    instance VARCHAR(100) NOT NULL,
    conversation_jid VARCHAR(255) NOT NULL,
    sender_jid VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    message_type VARCHAR(50) NOT NULL,
    content TEXT,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_from_me BOOLEAN DEFAULT FALSE,
    quoted_message_id VARCHAR(255),
    has_media BOOLEAN DEFAULT FALSE,
    media_type VARCHAR(50),
    INDEX idx_conversation (conversation_jid),
    INDEX idx_sender (sender_jid),
    INDEX idx_timestamp (timestamp),
    INDEX idx_instance (instance)
);

-- Tabela de conversas/grupos
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    jid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    type VARCHAR(20) NOT NULL, -- 'private' ou 'group'
    instance VARCHAR(100) NOT NULL,
    participant_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    first_message_at TIMESTAMP,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_instance (instance)
);

-- Tabela de participantes
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    jid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    instance VARCHAR(100) NOT NULL,
    message_count INTEGER DEFAULT 0,
    first_seen_at TIMESTAMP,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_instance (instance)
);

-- Tabela de análises comportamentais
CREATE TABLE IF NOT EXISTS behavioral_analysis (
    id SERIAL PRIMARY KEY,
    participant_jid VARCHAR(255) NOT NULL,
    conversation_jid VARCHAR(255),
    analysis_date DATE NOT NULL,

    -- Métricas de atividade
    message_count INTEGER DEFAULT 0,
    avg_message_length DECIMAL(10, 2),
    messages_per_hour JSONB, -- {"00": 5, "01": 2, ...}
    most_active_hour INTEGER,

    -- Métricas de engajamento
    response_time_avg_seconds INTEGER,
    conversation_initiations INTEGER,
    conversation_participations INTEGER,
    response_rate DECIMAL(5, 2), -- Porcentagem

    -- Análise de sentimento
    sentiment_positive INTEGER DEFAULT 0,
    sentiment_neutral INTEGER DEFAULT 0,
    sentiment_negative INTEGER DEFAULT 0,
    sentiment_score DECIMAL(5, 2), -- -1 a 1

    -- Análise de conteúdo
    top_topics JSONB, -- [{"topic": "trabalho", "count": 15}, ...]
    top_keywords JSONB, -- [{"word": "reunião", "count": 8}, ...]

    -- Metadados
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(participant_jid, conversation_jid, analysis_date),
    FOREIGN KEY (participant_jid) REFERENCES participants(jid),
    FOREIGN KEY (conversation_jid) REFERENCES conversations(jid),
    INDEX idx_participant (participant_jid),
    INDEX idx_conversation (conversation_jid),
    INDEX idx_date (analysis_date)
);

-- Tabela de insights gerados por IA
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    conversation_jid VARCHAR(255),
    participant_jid VARCHAR(255),
    insight_type VARCHAR(50) NOT NULL, -- 'pattern', 'anomaly', 'trend', 'recommendation'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(5, 2), -- 0 a 1
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_jid),
    INDEX idx_participant (participant_jid),
    INDEX idx_type (insight_type),
    INDEX idx_created (created_at)
);

-- Tabela de relacionamentos (quem fala com quem)
CREATE TABLE IF NOT EXISTS interaction_graph (
    id SERIAL PRIMARY KEY,
    from_participant_jid VARCHAR(255) NOT NULL,
    to_participant_jid VARCHAR(255) NOT NULL,
    conversation_jid VARCHAR(255) NOT NULL,
    interaction_count INTEGER DEFAULT 1,
    last_interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avg_response_time_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_participant_jid, to_participant_jid, conversation_jid),
    INDEX idx_from (from_participant_jid),
    INDEX idx_to (to_participant_jid),
    INDEX idx_conversation (conversation_jid)
);

-- View para dashboard: Resumo geral
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT
    COUNT(DISTINCT conversation_jid) as total_conversations,
    COUNT(DISTINCT sender_jid) as total_participants,
    COUNT(*) as total_messages,
    COUNT(DISTINCT DATE(to_timestamp(timestamp))) as active_days,
    AVG(CASE WHEN message_type = 'conversation' THEN LENGTH(content) END) as avg_message_length,
    MIN(to_timestamp(timestamp)) as first_message_date,
    MAX(to_timestamp(timestamp)) as last_message_date
FROM messages;

-- View para dashboard: Top participantes
CREATE OR REPLACE VIEW top_participants AS
SELECT
    p.jid,
    p.name,
    p.message_count,
    ba.sentiment_score,
    ba.response_rate,
    ba.most_active_hour,
    p.last_seen_at
FROM participants p
LEFT JOIN LATERAL (
    SELECT * FROM behavioral_analysis
    WHERE participant_jid = p.jid
    ORDER BY analysis_date DESC
    LIMIT 1
) ba ON true
ORDER BY p.message_count DESC
LIMIT 20;

-- View para dashboard: Atividade por hora
CREATE OR REPLACE VIEW activity_by_hour AS
SELECT
    EXTRACT(HOUR FROM to_timestamp(timestamp)) as hour,
    COUNT(*) as message_count,
    COUNT(DISTINCT sender_jid) as unique_senders,
    COUNT(DISTINCT conversation_jid) as unique_conversations
FROM messages
GROUP BY hour
ORDER BY hour;

-- View para dashboard: Sentimento geral
CREATE OR REPLACE VIEW sentiment_overview AS
SELECT
    analysis_date,
    SUM(sentiment_positive) as total_positive,
    SUM(sentiment_neutral) as total_neutral,
    SUM(sentiment_negative) as total_negative,
    AVG(sentiment_score) as avg_sentiment_score,
    COUNT(DISTINCT participant_jid) as participants_analyzed
FROM behavioral_analysis
GROUP BY analysis_date
ORDER BY analysis_date DESC
LIMIT 30;
