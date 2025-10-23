/**
 * Processador de intenções com IA
 * Analisa pedidos em linguagem natural e determina a ação
 */

import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import type { MentionEvent } from './detector.js';

export type IntentType =
  | 'analyze_conversation' // Analisar conversa
  | 'summarize_thread' // Resumir thread
  | 'search_messages' // Buscar mensagens
  | 'explain_context' // Explicar contexto
  | 'create_task' // Criar tarefa
  | 'transcribe_audio' // Transcrever áudio
  | 'general_question' // Pergunta geral
  | 'unknown'; // Não identificado

export interface Intent {
  type: IntentType;
  confidence: number; // 0-1
  parameters: Record<string, any>;
  reasoning?: string;
}

export class IntentProcessor {
  private anthropic: Anthropic | null = null;
  private groq: Groq | null = null;

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
  }

  /**
   * Processa o pedido e identifica a intenção
   */
  async processRequest(mention: MentionEvent): Promise<Intent> {
    const request = mention.request;

    // Se tiver API configurada, usa IA (prioriza Groq)
    if (this.groq || this.anthropic) {
      return this.processWithAI(request);
    }

    // Fallback: usa análise por palavras-chave
    return this.processWithKeywords(request);
  }

  /**
   * Processa com IA (Groq ou Claude)
   */
  private async processWithAI(request: string): Promise<Intent> {
    const systemPrompt = `Você é um assistente que analisa pedidos de usuários e identifica a intenção.

Pedido do usuário: "${request}"

Identifique a intenção entre:
- analyze_conversation: Usuário quer análise ou insights da conversa
- summarize_thread: Usuário quer resumo de mensagens
- search_messages: Usuário quer buscar mensagens específicas
- explain_context: Usuário quer explicação sobre algo na conversa
- create_task: Usuário quer criar uma tarefa/lembrete
- transcribe_audio: Usuário quer transcrever áudio
- general_question: Pergunta geral que requer resposta
- unknown: Não conseguiu identificar

Responda APENAS com JSON no formato:
{
  "type": "tipo_da_intencao",
  "confidence": 0.95,
  "parameters": {},
  "reasoning": "breve explicação"
}`;

    try {
      let responseText = '';

      // Tenta Groq primeiro (mais rápido)
      if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: systemPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
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

      // Extrai JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.processWithKeywords(request);
    } catch (error) {
      console.error('❌ Erro ao processar com IA:', error);
      return this.processWithKeywords(request);
    }
  }

  /**
   * Processa com palavras-chave (fallback)
   */
  private processWithKeywords(request: string): Intent {
    const lower = request.toLowerCase();

    // Analisar conversa
    if (
      /analisa|analisar|insights?|importante|destaque|análise/.test(lower)
    ) {
      return {
        type: 'analyze_conversation',
        confidence: 0.8,
        parameters: {},
        reasoning: 'Palavras-chave: análise, insights',
      };
    }

    // Resumir
    if (/resumo|resumir|resume|sumar[ií][sz]|síntese/.test(lower)) {
      return {
        type: 'summarize_thread',
        confidence: 0.8,
        parameters: {},
        reasoning: 'Palavras-chave: resumo',
      };
    }

    // Buscar
    if (/busca|buscar|encontra|procura|pesquisa/.test(lower)) {
      // Extrai o que buscar
      const query = request.replace(
        /busca|buscar|encontra|encontrar|procura|procurar|pesquisa|pesquisar/gi,
        ''
      );
      return {
        type: 'search_messages',
        confidence: 0.7,
        parameters: { query: query.trim() },
        reasoning: 'Palavras-chave: buscar',
      };
    }

    // Explicar
    if (
      /explica|explicar|o que é|porque|por que|como|entender/.test(lower)
    ) {
      return {
        type: 'explain_context',
        confidence: 0.7,
        parameters: {},
        reasoning: 'Palavras-chave: explicar',
      };
    }

    // Criar tarefa
    if (/cria|criar|lembr|tarefa|todo|fazer/.test(lower)) {
      return {
        type: 'create_task',
        confidence: 0.6,
        parameters: { task: request },
        reasoning: 'Palavras-chave: criar tarefa',
      };
    }

    // Transcrever
    if (/transcre|transcrição|áudio|audio|ouvir/.test(lower)) {
      return {
        type: 'transcribe_audio',
        confidence: 0.7,
        parameters: {},
        reasoning: 'Palavras-chave: transcrever',
      };
    }

    // Pergunta geral
    if (/\?|quem|qual|quando|onde|quanto/.test(lower)) {
      return {
        type: 'general_question',
        confidence: 0.6,
        parameters: { question: request },
        reasoning: 'Detectou pergunta',
      };
    }

    // Não identificado
    return {
      type: 'unknown',
      confidence: 0.3,
      parameters: { request },
      reasoning: 'Não identificou intenção clara',
    };
  }
}
