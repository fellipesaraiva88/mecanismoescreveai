-- ============================================
-- 📊 EXTENSÃO DO SCHEMA PARA ANÁLISE COMPORTAMENTAL AVANÇADA
-- Baseado no WhatsApp Evolution API
-- ============================================

-- ============================================
-- EXTENSÕES DO POSTGRESQL
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto
CREATE EXTENSION IF NOT EXISTS "pgvector"; -- Para embeddings (busca semântica)

-- ============================================
-- TABELAS ADICIONAIS PARA ANÁLISE AVANÇADA
-- ============================================

-- Análise de Sentimento por Mensagem
CREATE TABLE IF NOT EXISTS message_sentiment (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    sentiment_label VARCHAR(20) NOT NULL, -- 'positive', 'negative', 'neutral', 'mixed'
    sentiment_score DECIMAL(5, 2), -- -1.00 a +1.00
    emotions JSONB DEFAULT '{}', -- {"joy": 0.8, "sadness": 0.1, "anger": 0.0, "fear": 0.0, ...}
    confidence DECIMAL(5, 2), -- 0.00 a 1.00
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_used VARCHAR(50), -- 'claude', 'openai', 'groq'
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    INDEX idx_sentiment_label (sentiment_label),
    INDEX idx_sentiment_score (sentiment_score)
);

-- Tópicos de Conversa
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'trabalho', 'pessoal', 'família', 'tecnologia', etc.
    keywords TEXT[], -- Array de palavras-chave relacionadas
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- Relacionamento Mensagem-Tópico (muitos para muitos)
CREATE TABLE IF NOT EXISTS message_topics (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    topic_id INTEGER NOT NULL,
    relevance_score DECIMAL(5, 2) DEFAULT 0.00, -- 0.00 a 1.00
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, topic_id),
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_message (message_id),
    INDEX idx_topic (topic_id)
);

-- Interesses dos Participantes (baseado em tópicos)
CREATE TABLE IF NOT EXISTS participant_interests (
    id SERIAL PRIMARY KEY,
    participant_jid VARCHAR(255) NOT NULL,
    topic_id INTEGER NOT NULL,
    interest_score DECIMAL(5, 2) DEFAULT 0.00, -- 0.00 a 1.00
    mention_count INTEGER DEFAULT 0,
    last_mentioned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_jid, topic_id),
    FOREIGN KEY (participant_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_participant (participant_jid),
    INDEX idx_interest_score (interest_score DESC)
);

-- Padrões de Comportamento Detectados
CREATE TABLE IF NOT EXISTS behavior_patterns (
    id SERIAL PRIMARY KEY,
    participant_jid VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'active_hours', 'response_time', 'message_frequency', etc.
    pattern_name VARCHAR(100),
    pattern_data JSONB NOT NULL, -- Dados específicos do padrão
    confidence DECIMAL(5, 2), -- 0.00 a 1.00
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observation_count INTEGER DEFAULT 1,
    FOREIGN KEY (participant_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    INDEX idx_participant_pattern (participant_jid, pattern_type),
    INDEX idx_pattern_type (pattern_type)
);

-- Anomalias Comportamentais
CREATE TABLE IF NOT EXISTS behavioral_anomalies (
    id SERIAL PRIMARY KEY,
    participant_jid VARCHAR(255) NOT NULL,
    conversation_jid VARCHAR(255),
    anomaly_type VARCHAR(50) NOT NULL, -- 'sudden_silence', 'activity_spike', 'sentiment_shift', etc.
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high'
    expected_value DECIMAL(10, 2),
    actual_value DECIMAL(10, 2),
    deviation_score DECIMAL(5, 2), -- Quão grande é o desvio
    metadata JSONB DEFAULT '{}',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (participant_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    FOREIGN KEY (conversation_jid) REFERENCES conversations(jid) ON DELETE CASCADE,
    INDEX idx_participant (participant_jid),
    INDEX idx_severity (severity),
    INDEX idx_resolved (resolved_at)
);

-- Memórias Importantes (RAG - Retrieval Augmented Generation)
CREATE TABLE IF NOT EXISTS conversation_memories (
    id SERIAL PRIMARY KEY,
    conversation_jid VARCHAR(255),
    participant_jid VARCHAR(255),
    memory_type VARCHAR(50) NOT NULL, -- 'fact', 'preference', 'decision', 'event', 'opinion'
    content TEXT NOT NULL,
    source_message_id VARCHAR(255),
    importance_score DECIMAL(5, 2) DEFAULT 0.50, -- 0.00 a 1.00
    embedding VECTOR(1536), -- Embedding para busca semântica (OpenAI ada-002)
    tags TEXT[],
    recalled_count INTEGER DEFAULT 0,
    last_recalled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_jid) REFERENCES conversations(jid) ON DELETE CASCADE,
    FOREIGN KEY (participant_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    FOREIGN KEY (source_message_id) REFERENCES messages(message_id) ON DELETE SET NULL,
    INDEX idx_conversation (conversation_jid),
    INDEX idx_participant (participant_jid),
    INDEX idx_importance (importance_score DESC)
);

-- Índice para busca vetorial de similaridade (cosine)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON conversation_memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Contextos de Conversação (threads/temas dentro de uma conversa)
CREATE TABLE IF NOT EXISTS conversation_contexts (
    id SERIAL PRIMARY KEY,
    conversation_jid VARCHAR(255) NOT NULL,
    context_name VARCHAR(255),
    start_message_id VARCHAR(255),
    end_message_id VARCHAR(255),
    participant_jids TEXT[], -- Participantes ativos neste contexto
    main_topic_id INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    summary TEXT,
    sentiment_progression JSONB, -- Evolução do sentimento: [{"time": "...", "score": 0.5}, ...]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_jid) REFERENCES conversations(jid) ON DELETE CASCADE,
    FOREIGN KEY (main_topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    INDEX idx_conversation (conversation_jid),
    INDEX idx_timerange (start_time, end_time)
);

-- Relacionamentos entre Participantes (grafo social)
CREATE TABLE IF NOT EXISTS participant_relationships (
    id SERIAL PRIMARY KEY,
    participant_a_jid VARCHAR(255) NOT NULL,
    participant_b_jid VARCHAR(255) NOT NULL,
    relationship_strength DECIMAL(5, 2) DEFAULT 0.00, -- 0.00 a 1.00
    total_interactions INTEGER DEFAULT 0,
    common_groups INTEGER DEFAULT 0,
    avg_response_time_seconds INTEGER,
    last_interaction_at TIMESTAMP,
    relationship_data JSONB DEFAULT '{}', -- Dados adicionais
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_a_jid, participant_b_jid),
    FOREIGN KEY (participant_a_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    FOREIGN KEY (participant_b_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    CHECK (participant_a_jid < participant_b_jid), -- Evita duplicatas (A-B e B-A)
    INDEX idx_strength (relationship_strength DESC),
    INDEX idx_participants (participant_a_jid, participant_b_jid)
);

-- Grupos de Afinidade (clusters detectados automaticamente)
CREATE TABLE IF NOT EXISTS affinity_clusters (
    id SERIAL PRIMARY KEY,
    cluster_name VARCHAR(255),
    description TEXT,
    member_jids TEXT[], -- Array de JIDs dos membros
    cohesion_score DECIMAL(5, 2), -- 0.00 a 1.00 - quão coeso é o grupo
    common_topics INTEGER[], -- IDs de tópicos comuns
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cohesion (cohesion_score DESC)
);

-- Tendências Emergentes
CREATE TABLE IF NOT EXISTS emerging_trends (
    id SERIAL PRIMARY KEY,
    trend_type VARCHAR(50) NOT NULL, -- 'topic_rise', 'sentiment_change', 'activity_increase'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    growth_rate DECIMAL(5, 2), -- Percentual de crescimento
    time_window VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    trend_data JSONB DEFAULT '{}',
    confidence DECIMAL(5, 2),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trend_type (trend_type),
    INDEX idx_active (is_active) WHERE is_active = TRUE
);

-- Regras de Alertas
CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'behavior_change', 'keyword_detection', 'sentiment_threshold', etc.
    conditions JSONB NOT NULL, -- Condições para disparar: {"sentiment_score": {"<": -0.5}, ...}
    target_type VARCHAR(20), -- 'participant', 'conversation', 'global'
    target_jid VARCHAR(255), -- JID específico ou NULL para global
    actions JSONB DEFAULT '{}', -- Ações a executar: {"notify": true, "tag": "urgent"}
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 5, -- 1 (baixa) a 10 (alta)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (is_active) WHERE is_active = TRUE,
    INDEX idx_rule_type (rule_type)
);

-- Alertas Disparados
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_rule_id INTEGER,
    conversation_jid VARCHAR(255),
    participant_jid VARCHAR(255),
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL,
    FOREIGN KEY (conversation_jid) REFERENCES conversations(jid) ON DELETE CASCADE,
    FOREIGN KEY (participant_jid) REFERENCES participants(jid) ON DELETE CASCADE,
    INDEX idx_unread (is_read) WHERE is_read = FALSE,
    INDEX idx_severity (severity),
    INDEX idx_triggered (triggered_at DESC)
);

-- Dashboard Configuração (widgets e preferências)
CREATE TABLE IF NOT EXISTS dashboard_config (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) DEFAULT 'default', -- Para suportar múltiplos usuários no futuro
    widget_type VARCHAR(50) NOT NULL, -- 'conversation_stats', 'sentiment_chart', 'relationship_graph', etc.
    widget_config JSONB NOT NULL,
    position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_visible (is_visible) WHERE is_visible = TRUE
);

-- Cache de Métricas (para performance)
CREATE TABLE IF NOT EXISTS metrics_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_value JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expires (expires_at)
);

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para calcular força de relacionamento
CREATE OR REPLACE FUNCTION calculate_relationship_strength(
    jid_a VARCHAR(255),
    jid_b VARCHAR(255)
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    interaction_count INT;
    common_groups_count INT;
    avg_response_time INT;
    strength DECIMAL(5,2);
BEGIN
    -- Contar interações diretas
    SELECT COUNT(*)
    INTO interaction_count
    FROM interaction_graph
    WHERE (from_participant_jid = jid_a AND to_participant_jid = jid_b)
       OR (from_participant_jid = jid_b AND to_participant_jid = jid_a);

    -- Contar grupos em comum (precisaria de uma tabela de membros de grupo)
    -- Por enquanto, simplificado
    common_groups_count := 0;

    -- Calcular força baseada em interações
    strength := LEAST(1.00, (interaction_count::DECIMAL / 100.0));

    RETURN strength;
END;
$$ LANGUAGE plpgsql;

-- Função para detectar mudança de sentimento
CREATE OR REPLACE FUNCTION detect_sentiment_shift(
    p_jid VARCHAR(255),
    days_back INTEGER DEFAULT 7
) RETURNS TABLE(
    current_avg DECIMAL(5,2),
    previous_avg DECIMAL(5,2),
    shift_magnitude DECIMAL(5,2),
    is_significant BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT AVG(ms.sentiment_score) as avg_score
        FROM messages m
        JOIN message_sentiment ms ON m.message_id = ms.message_id
        WHERE m.sender_jid = p_jid
          AND m.timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '1 day' * days_back))::BIGINT
    ),
    previous_period AS (
        SELECT AVG(ms.sentiment_score) as avg_score
        FROM messages m
        JOIN message_sentiment ms ON m.message_id = ms.message_id
        WHERE m.sender_jid = p_jid
          AND m.timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '1 day' * (days_back * 2)))::BIGINT
          AND m.timestamp < EXTRACT(EPOCH FROM (NOW() - INTERVAL '1 day' * days_back))::BIGINT
    )
    SELECT
        COALESCE(c.avg_score, 0.0)::DECIMAL(5,2) as current_avg,
        COALESCE(p.avg_score, 0.0)::DECIMAL(5,2) as previous_avg,
        ABS(COALESCE(c.avg_score, 0.0) - COALESCE(p.avg_score, 0.0))::DECIMAL(5,2) as shift_magnitude,
        (ABS(COALESCE(c.avg_score, 0.0) - COALESCE(p.avg_score, 0.0)) > 0.3)::BOOLEAN as is_significant
    FROM current_period c, previous_period p;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS PARA DASHBOARD
-- ============================================

-- View: Estatísticas de Engajamento por Participante
CREATE OR REPLACE VIEW participant_engagement_stats AS
SELECT
    p.jid,
    p.name,
    p.message_count,
    COUNT(DISTINCT ig.conversation_jid) as conversations_participated,
    AVG(ig.avg_response_time_seconds) as avg_response_time,
    MAX(p.last_seen_at) as last_active,
    (
        SELECT AVG(sentiment_score)
        FROM messages m
        JOIN message_sentiment ms ON m.message_id = ms.message_id
        WHERE m.sender_jid = p.jid
    ) as avg_sentiment
FROM participants p
LEFT JOIN interaction_graph ig ON ig.from_participant_jid = p.jid
GROUP BY p.jid, p.name, p.message_count;

-- View: Top Tópicos por Período
CREATE OR REPLACE VIEW trending_topics AS
SELECT
    t.id,
    t.name,
    t.category,
    COUNT(mt.message_id) as mention_count,
    AVG(mt.relevance_score) as avg_relevance,
    COUNT(DISTINCT m.sender_jid) as unique_participants,
    MAX(m.timestamp) as last_mentioned_timestamp
FROM topics t
JOIN message_topics mt ON t.id = mt.topic_id
JOIN messages m ON mt.message_id = m.message_id
WHERE m.timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '7 days'))::BIGINT
GROUP BY t.id, t.name, t.category
ORDER BY mention_count DESC
LIMIT 20;

-- View: Relacionamentos Mais Fortes
CREATE OR REPLACE VIEW top_relationships AS
SELECT
    pr.id,
    pa.name as participant_a_name,
    pb.name as participant_b_name,
    pr.relationship_strength,
    pr.total_interactions,
    pr.last_interaction_at
FROM participant_relationships pr
JOIN participants pa ON pa.jid = pr.participant_a_jid
JOIN participants pb ON pb.jid = pr.participant_b_jid
ORDER BY pr.relationship_strength DESC
LIMIT 50;

-- View: Alertas Ativos Não Lidos
CREATE OR REPLACE VIEW active_alerts AS
SELECT
    a.id,
    a.title,
    a.message,
    a.severity,
    a.alert_type,
    p.name as participant_name,
    c.name as conversation_name,
    a.triggered_at
FROM alerts a
LEFT JOIN participants p ON p.jid = a.participant_jid
LEFT JOIN conversations c ON c.jid = a.conversation_jid
WHERE a.is_read = FALSE
ORDER BY
    CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'warning' THEN 2
        WHEN 'info' THEN 3
    END,
    a.triggered_at DESC;

-- View: Análise de Sentimento por Dia
CREATE OR REPLACE VIEW daily_sentiment_analysis AS
SELECT
    DATE(to_timestamp(m.timestamp)) as date,
    COUNT(*) as total_messages,
    AVG(ms.sentiment_score) as avg_sentiment,
    COUNT(CASE WHEN ms.sentiment_label = 'positive' THEN 1 END) as positive_count,
    COUNT(CASE WHEN ms.sentiment_label = 'neutral' THEN 1 END) as neutral_count,
    COUNT(CASE WHEN ms.sentiment_label = 'negative' THEN 1 END) as negative_count
FROM messages m
JOIN message_sentiment ms ON m.message_id = ms.message_id
GROUP BY DATE(to_timestamp(m.timestamp))
ORDER BY date DESC;

-- View: Mapa de Atividade por Hora do Dia
CREATE OR REPLACE VIEW hourly_activity_heatmap AS
SELECT
    EXTRACT(HOUR FROM to_timestamp(m.timestamp)) as hour,
    EXTRACT(DOW FROM to_timestamp(m.timestamp)) as day_of_week, -- 0=Sunday, 6=Saturday
    COUNT(*) as message_count,
    COUNT(DISTINCT sender_jid) as unique_senders
FROM messages m
WHERE m.timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))::BIGINT
GROUP BY hour, day_of_week
ORDER BY day_of_week, hour;

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_interests_updated_at
    BEFORE UPDATE ON participant_interests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participant_relationships_updated_at
    BEFORE UPDATE ON participant_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_contexts_updated_at
    BEFORE UPDATE ON conversation_contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (SEEDS)
-- ============================================

-- Tópicos pré-definidos comuns
INSERT INTO topics (name, category, keywords) VALUES
    ('Trabalho', 'profissional', ARRAY['trabalho', 'reunião', 'projeto', 'deadline', 'cliente']),
    ('Família', 'pessoal', ARRAY['família', 'filho', 'mãe', 'pai', 'irmão', 'casa']),
    ('Tecnologia', 'interesse', ARRAY['tecnologia', 'app', 'software', 'código', 'programação']),
    ('Saúde', 'pessoal', ARRAY['saúde', 'médico', 'exercício', 'dieta', 'bem-estar']),
    ('Entretenimento', 'lazer', ARRAY['filme', 'série', 'música', 'jogo', 'show']),
    ('Finanças', 'profissional', ARRAY['dinheiro', 'investimento', 'conta', 'pagar', 'banco']),
    ('Educação', 'desenvolvimento', ARRAY['curso', 'estudo', 'aprender', 'faculdade', 'escola']),
    ('Viagem', 'lazer', ARRAY['viagem', 'férias', 'hotel', 'passagem', 'turismo'])
ON CONFLICT (name) DO NOTHING;

-- Regras de alerta padrão
INSERT INTO alert_rules (name, description, rule_type, conditions, target_type, is_active, priority) VALUES
    (
        'Sentimento Muito Negativo',
        'Alerta quando detectar sentimento muito negativo em mensagens',
        'sentiment_threshold',
        '{"sentiment_score": {"<": -0.7}}'::JSONB,
        'participant',
        TRUE,
        8
    ),
    (
        'Queda Brusca de Atividade',
        'Alerta quando participante ativo subitamente para de interagir',
        'behavior_change',
        '{"activity_drop": {"threshold": 0.5, "days": 3}}'::JSONB,
        'participant',
        TRUE,
        6
    ),
    (
        'Novo Participante Altamente Ativo',
        'Alerta quando novo participante se torna muito ativo rapidamente',
        'behavior_change',
        '{"new_participant_spike": {"messages_per_day": 50}}'::JSONB,
        'participant',
        TRUE,
        5
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE message_sentiment IS 'Análise de sentimento por mensagem usando IA (Claude, OpenAI, etc)';
COMMENT ON TABLE conversation_memories IS 'Memórias importantes extraídas das conversas para uso em RAG';
COMMENT ON TABLE participant_relationships IS 'Grafo de relacionamentos sociais entre participantes';
COMMENT ON TABLE behavior_patterns IS 'Padrões comportamentais detectados automaticamente';
COMMENT ON TABLE behavioral_anomalies IS 'Anomalias e mudanças comportamentais significativas';
COMMENT ON TABLE affinity_clusters IS 'Grupos de afinidade detectados por clustering automático';
COMMENT ON TABLE emerging_trends IS 'Tendências emergentes em tópicos, sentimentos e atividades';

-- ============================================
-- FIM DA EXTENSÃO DO SCHEMA
-- ============================================
