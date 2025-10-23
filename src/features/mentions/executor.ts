/**
 * Executor de ações baseado em intenções
 * Executa as ações identificadas pelo processador
 */

import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import axios from 'axios';
import type { Intent } from './processor.js';
import type { MentionEvent } from './detector.js';

export interface ExecutionResult {
  success: boolean;
  response: string;
  data?: any;
  error?: string;
}

export class ActionExecutor {
  private anthropic: Anthropic | null = null;
  private groq: Groq | null = null;
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    // Tenta Groq primeiro (mais rápido e gratuito)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      this.groq = new Groq({ apiKey: groqKey });
    }

    // Fallback para Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  /**
   * Executa uma ação baseada na intenção
   */
  async execute(
    intent: Intent,
    mention: MentionEvent
  ): Promise<ExecutionResult> {
    console.log(`🎯 Executando ação: ${intent.type}`);
    console.log(`   Confiança: ${(intent.confidence * 100).toFixed(0)}%`);
    console.log(`   Razão: ${intent.reasoning}`);

    try {
      switch (intent.type) {
        case 'analyze_conversation':
          return await this.analyzeConversation(mention);

        case 'summarize_thread':
          return await this.summarizeThread(mention);

        case 'search_messages':
          return await this.searchMessages(mention, intent.parameters);

        case 'explain_context':
          return await this.explainContext(mention);

        case 'create_task':
          return await this.createTask(mention, intent.parameters);

        case 'general_question':
          return await this.answerQuestion(mention);

        default:
          return {
            success: false,
            response:
              'Desculpe, não entendi o que você quer. Tente reformular seu pedido.',
            error: 'Intent type not supported',
          };
      }
    } catch (error) {
      console.error('❌ Erro ao executar ação:', error);
      return {
        success: false,
        response:
          'Ops! Ocorreu um erro ao processar seu pedido. Tente novamente.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analisa a conversa e gera insights
   */
  private async analyzeConversation(
    mention: MentionEvent
  ): Promise<ExecutionResult> {
    // TODO: Implementar busca de mensagens do banco de dados

    if (!this.groq && !this.anthropic) {
      return {
        success: false,
        response:
          '⚠️ Análise de conversa requer configuração de API de IA (GROQ_API_KEY ou ANTHROPIC_API_KEY)',
      };
    }

    // Por enquanto, retorna uma análise mockada
    const mockAnalysis = `📊 *Análise da Conversa*

🔍 *Principais Insights:*
• A conversa está focada em desenvolvimento e automação
• Há discussão sobre integração de sistemas
• Tom colaborativo e técnico

💡 *Pontos Importantes:*
1. Implementação de webhooks
2. Sistema de menções ao bot
3. Processamento com IA

⚠️ *Nota:* Esta é uma análise inicial. Para análises mais profundas, preciso de acesso às mensagens anteriores do grupo.`;

    return {
      success: true,
      response: mockAnalysis,
      data: { type: 'analysis' },
    };
  }

  /**
   * Resume a thread de mensagens
   */
  private async summarizeThread(
    mention: MentionEvent
  ): Promise<ExecutionResult> {
    if (!this.groq && !this.anthropic) {
      return {
        success: false,
        response:
          '⚠️ Resumo requer configuração de API de IA (GROQ_API_KEY ou ANTHROPIC_API_KEY)',
      };
    }

    // Mock de resumo
    const mockSummary = `📝 *Resumo da Conversa*

🎯 *Tema Principal:*
Sistema de automação com WhatsApp e IA

💬 *Resumo:*
O grupo está desenvolvendo um sistema de bot para WhatsApp que permite invocar funcionalidades através de menções (@escreveai). O bot pode analisar conversas, resumir threads, buscar mensagens e executar tarefas através de comandos em linguagem natural.

✅ *Próximos Passos:*
• Testar sistema de menções
• Configurar APIs de IA
• Implementar busca em banco de dados`;

    return {
      success: true,
      response: mockSummary,
      data: { type: 'summary' },
    };
  }

  /**
   * Busca mensagens específicas
   */
  private async searchMessages(
    mention: MentionEvent,
    params: any
  ): Promise<ExecutionResult> {
    const query = params.query || '';

    return {
      success: true,
      response: `🔍 Buscando por: "${query}"

⚠️ *Em desenvolvimento*
A funcionalidade de busca será implementada em breve. Por enquanto, você pode usar:
• 📌 Reação para salvar mensagens importantes
• /salvos para ver mensagens salvas`,
      data: { query },
    };
  }

  /**
   * Explica contexto da conversa
   */
  private async explainContext(
    mention: MentionEvent
  ): Promise<ExecutionResult> {
    if (!this.groq && !this.anthropic) {
      return {
        success: false,
        response:
          '⚠️ Explicação de contexto requer configuração de API de IA (GROQ_API_KEY ou ANTHROPIC_API_KEY)',
      };
    }

    return {
      success: true,
      response: `💡 *Explicação do Contexto*

Estamos desenvolvendo um bot inteligente para WhatsApp que:

🤖 *Funcionalidades:*
• Responde a menções (@escreveai)
• Analisa conversas com IA
• Resume threads de mensagens
• Busca informações
• Executa tarefas

🎯 *Como usar:*
Basta mencionar @escreveai seguido do seu pedido. Exemplo:
• "@escreveai analisa nossa conversa"
• "@escreveai resume as últimas mensagens"
• "@escreveai busca informações sobre X"`,
    };
  }

  /**
   * Cria uma tarefa/lembrete
   */
  private async createTask(
    mention: MentionEvent,
    params: any
  ): Promise<ExecutionResult> {
    const task = params.task || mention.request;

    return {
      success: true,
      response: `✅ *Tarefa Criada*

📋 ${task}

⚠️ *Nota:* Sistema de tarefas em desenvolvimento. Por enquanto, use a reação 🎯 para marcar mensagens como tarefas.`,
      data: { task },
    };
  }

  /**
   * Responde perguntas gerais
   */
  private async answerQuestion(
    mention: MentionEvent
  ): Promise<ExecutionResult> {
    if (!this.groq && !this.anthropic) {
      return {
        success: false,
        response:
          '⚠️ Para responder perguntas, configure API de IA (GROQ_API_KEY ou ANTHROPIC_API_KEY)',
      };
    }

    try {
      let responseText = '';

      const systemPrompt = `Você é um assistente útil em um grupo de WhatsApp.

Pergunta: ${mention.request}

Responda de forma clara, concisa e útil (máximo 3 parágrafos).`;

      // Usa Groq (mais rápido)
      if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: systemPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });

        responseText = response.choices[0]?.message?.content || '';
      }
      // Fallback para Anthropic
      else if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: systemPrompt,
            },
          ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          responseText = content.text;
        }
      }

      if (responseText) {
        return {
          success: true,
          response: `💬 *Resposta:*

${responseText}`,
        };
      }

      return {
        success: false,
        response: 'Não consegui gerar uma resposta.',
      };
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
      return {
        success: false,
        response: 'Desculpe, não consegui responder sua pergunta no momento.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Envia resposta via Evolution API
   */
  async sendResponse(
    jid: string,
    response: string,
    instance: string = 'saraiva'
  ): Promise<void> {
    try {
      await axios.post(
        `${this.evolutionApiUrl}/message/sendText/${instance}`,
        {
          number: jid,
          text: response,
        },
        {
          headers: {
            apikey: this.evolutionApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Resposta enviada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar resposta:', error);
      throw error;
    }
  }
}
