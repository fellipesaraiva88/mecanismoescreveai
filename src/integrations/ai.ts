/**
 * Módulo de integração com LLMs
 * Suporta: Anthropic, Groq, Google Gemini
 */

import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export interface TranscriptionResult {
  text: string;
  duration?: number;
  language?: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Cliente Groq para transcrição de áudio
 */
export class GroqClient {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  /**
   * Transcreve áudio para texto usando Whisper
   * Nota: audioFile deve ser um File ou Blob do navegador ou fs.createReadStream() do Node
   */
  async transcribeAudio(
    audioFile: any,
    options?: {
      language?: string;
      prompt?: string;
      temperature?: number;
    }
  ): Promise<TranscriptionResult> {
    const response = await this.client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: options?.language || 'pt',
      prompt: options?.prompt,
      temperature: options?.temperature || 0,
    });

    return {
      text: response.text,
      language: options?.language || 'pt',
    };
  }

  /**
   * Gera texto usando modelos Groq (alternativa rápida e barata)
   */
  async generate(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const model = options?.model || 'llama-3.3-70b-versatile';

    const completion = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    });

    const message = completion.choices[0]?.message;

    return {
      text: message?.content || '',
      model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    };
  }
}

/**
 * Cliente Anthropic (Claude)
 */
export class AnthropicClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<LLMResponse> {
    const model = options?.model || 'claude-3-5-sonnet-20241022';

    const message = await this.client.messages.create({
      model,
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.7,
      system: options?.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find((c) => c.type === 'text');

    return {
      text: textContent && 'text' in textContent ? textContent.text : '',
      model,
      usage: {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
      },
    };
  }
}

/**
 * Cliente Google Gemini (via LangChain)
 */
export class GeminiClient {
  private model: ChatGoogleGenerativeAI;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash-exp') {
    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      model,
      temperature: 0.7,
    });
  }

  async generate(prompt: string): Promise<LLMResponse> {
    const response = await this.model.invoke(prompt);

    return {
      text: response.content.toString(),
      model: this.model.model,
    };
  }

  /**
   * Gera com template de prompt (útil para workflows complexos)
   */
  async generateWithTemplate(
    template: string,
    variables: Record<string, any>
  ): Promise<LLMResponse> {
    const promptTemplate = ChatPromptTemplate.fromTemplate(template);
    const chain = promptTemplate.pipe(this.model);

    const response = await chain.invoke(variables);

    return {
      text: response.content.toString(),
      model: this.model.model,
    };
  }
}

/**
 * Factory para criar clientes de IA
 */
export class AIClientFactory {
  static createGroq(apiKey?: string): GroqClient {
    return new GroqClient(apiKey || process.env.GROQ_API_KEY || '');
  }

  static createAnthropic(apiKey?: string): AnthropicClient {
    return new AnthropicClient(apiKey || process.env.ANTHROPIC_API_KEY || '');
  }

  static createGemini(apiKey?: string, model?: string): GeminiClient {
    return new GeminiClient(apiKey || process.env.GOOGLE_AI_KEY || '', model);
  }
}

/**
 * Prompts pré-definidos úteis
 */
export const Prompts = {
  /**
   * Prompt para aplicar técnica OGRT (do workflow Ultron)
   */
  OGRT_APLICACAO: `Você é um assistente especializado em processar transcrições de áudio.

Sua tarefa é:
1. Ler a transcrição fornecida
2. Aplicar a técnica OGRT (Objetivo, Garantia, Resultado, Tempo)
3. Retornar um resumo estruturado e claro

Transcrição:
{transcription}

Responda de forma objetiva e estruturada.`,

  /**
   * Prompt revisor OGRT
   */
  OGRT_REVISOR: `Você é um revisor especializado.

Revise o seguinte texto aplicando melhorias de:
- Clareza
- Estrutura
- Gramática
- Objetividade

Texto original:
{text}

Retorne APENAS o texto revisado, sem comentários adicionais.`,

  /**
   * Prompt para áudios curtos (<30s)
   */
  RESUMO_CURTO: `Resuma a seguinte transcrição de forma ultra-concisa (máximo 2 frases):

{transcription}`,
};
