/**
 * Formatador OGRT - Aplica prompts de formatação
 * Baseado no workflow Ultron do n8n
 */

import Groq from 'groq-sdk';

export interface FormatterResult {
  formatted: string;
  original: string;
  needsReadMore: boolean;
}

export class OGRTFormatter {
  private groq: Groq;

  // Limite de caracteres para "Ler Mais"
  private readonly READ_MORE_LIMIT = 800;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    this.groq = new Groq({ apiKey: groqKey });
  }

  /**
   * Prompt OGRT para áudios curtos (< 30s)
   */
  private getShortAudioPrompt(transcription: string): string {
    return `Você é um assistente especializado em formatar transcrições de áudio do WhatsApp.

**Tarefa:** Formate a transcrição abaixo de forma clara e objetiva.

**Transcrição Original:**
${transcription}

**Instruções:**
1. Corrija erros de transcrição
2. Adicione pontuação adequada
3. Separe em parágrafos se necessário
4. Mantenha o tom e estilo original
5. Seja conciso e direto
6. NÃO adicione informações que não estão na transcrição
7. NÃO faça resumos, apenas formate

**Responda APENAS com o texto formatado, sem introduções ou explicações.**`;
  }

  /**
   * Prompt OGRT para áudios longos (> 30s)
   */
  private getLongAudioPrompt(transcription: string): string {
    return `Você é um assistente especializado em formatar e organizar transcrições de áudio do WhatsApp.

**Tarefa:** Formate e organize a transcrição abaixo de forma estruturada.

**Transcrição Original:**
${transcription}

**Instruções:**
1. Corrija erros de transcrição
2. Adicione pontuação adequada
3. Organize em parágrafos e tópicos quando apropriado
4. Mantenha o tom e estilo original
5. Se houver múltiplos assuntos, separe claramente
6. NÃO adicione informações que não estão na transcrição
7. NÃO faça resumos, apenas organize e formate

**Responda APENAS com o texto formatado, sem introduções ou explicações.**`;
  }

  /**
   * Aplica formatação OGRT na transcrição
   */
  async format(
    transcription: string,
    duration: number
  ): Promise<FormatterResult> {
    console.log('\n📝 Aplicando formatação OGRT...');

    try {
      // Escolhe prompt baseado na duração
      const isShort = duration < 30;
      const prompt = isShort
        ? this.getShortAudioPrompt(transcription)
        : this.getLongAudioPrompt(transcription);

      console.log(`   Tipo: ${isShort ? 'Curta' : 'Longa'} (${duration}s)`);

      // Formata com GROQ
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      });

      const formatted = response.choices[0]?.message?.content || transcription;

      // Verifica se precisa "Ler Mais"
      const needsReadMore = formatted.length > this.READ_MORE_LIMIT;

      console.log(`✅ Formatação concluída (${formatted.length} caracteres)`);
      if (needsReadMore) {
        console.log('   ⚠️  Texto longo - "Ler Mais" será aplicado');
      }

      return {
        formatted,
        original: transcription,
        needsReadMore,
      };
    } catch (error) {
      console.error('❌ Erro ao formatar:', error);

      // Fallback: retorna transcrição original
      return {
        formatted: transcription,
        original: transcription,
        needsReadMore: transcription.length > this.READ_MORE_LIMIT,
      };
    }
  }

  /**
   * Aplica sistema "Ler Mais" para textos longos
   */
  applyReadMore(text: string): string {
    if (text.length <= this.READ_MORE_LIMIT) {
      return text;
    }

    // Pega os primeiros caracteres até o limite
    const preview = text.substring(0, this.READ_MORE_LIMIT);

    // Tenta cortar em uma quebra de linha ou ponto
    let cutPoint = this.READ_MORE_LIMIT;

    const lastLineBreak = preview.lastIndexOf('\n');
    const lastPeriod = preview.lastIndexOf('.');

    if (lastLineBreak > this.READ_MORE_LIMIT - 100) {
      cutPoint = lastLineBreak;
    } else if (lastPeriod > this.READ_MORE_LIMIT - 100) {
      cutPoint = lastPeriod + 1;
    }

    const visibleText = text.substring(0, cutPoint).trim();
    const hiddenText = text.substring(cutPoint).trim();

    // Formata com "Ler Mais"
    return `${visibleText}

_[... Ler Mais]_

${hiddenText}`;
  }
}
