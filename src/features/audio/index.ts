/**
 * Sistema Ultron de Transcrição de Áudios
 * Orquestra detecção, transcrição, formatação e envio
 */

import type { WhatsAppWebhookPayload } from '../../types/webhook.js';
import { AudioTranscriber } from './transcriber.js';
import { OGRTFormatter } from './formatter.js';
import axios from 'axios';

export class UltronSystem {
  private transcriber: AudioTranscriber;
  private formatter: OGRTFormatter;
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    this.transcriber = new AudioTranscriber();
    this.formatter = new OGRTFormatter();
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  /**
   * Verifica se deve processar o áudio
   */
  shouldProcess(payload: WhatsAppWebhookPayload): boolean {
    return AudioTranscriber.isAudioMessage(payload);
  }

  /**
   * Processa um áudio completo (Ultron)
   */
  async processAudio(
    payload: WhatsAppWebhookPayload,
    instance: string = 'saraiva'
  ): Promise<void> {
    console.log('\n🎯 ================================');
    console.log('🎯   ULTRON ATIVADO');
    console.log('🎯 ================================\n');

    const jid = payload.data.key.remoteJid;

    try {
      // 1. Transcreve o áudio
      const transcription = await this.transcriber.transcribe(
        payload,
        instance
      );

      // 2. Formata com OGRT
      const formatted = await this.formatter.format(
        transcription.text,
        transcription.duration
      );

      // 3. Aplica "Ler Mais" se necessário
      let finalText = formatted.formatted;
      if (formatted.needsReadMore) {
        finalText = this.formatter.applyReadMore(formatted.formatted);
      }

      // 4. Monta mensagem final
      const message = this.buildMessage(finalText, transcription.duration);

      // 5. Envia resposta
      await this.sendResponse(jid, message, instance);

      console.log('✅ Ultron concluído com sucesso!\n');
      console.log('🎯 ================================\n');
    } catch (error) {
      console.error('❌ Erro no Ultron:', error);

      // Envia mensagem de erro
      try {
        await this.sendResponse(
          jid,
          '⚠️ Desculpe, não consegui transcrever o áudio. Tente novamente.',
          instance
        );
      } catch (sendError) {
        console.error('❌ Erro ao enviar mensagem de erro:', sendError);
      }

      console.log('\n🎯 ================================\n');
    }
  }

  /**
   * Monta a mensagem final com a transcrição
   */
  private buildMessage(text: string, duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeStr =
      minutes > 0 ? `${minutes}m${seconds}s` : `${seconds}s`;

    return `🎙️ *Transcrição do Áudio* (${timeStr})

${text}

_Transcrito automaticamente pelo Ultron_ 🤖`;
  }

  /**
   * Envia resposta via Evolution API
   */
  private async sendResponse(
    jid: string,
    text: string,
    instance: string = 'saraiva'
  ): Promise<void> {
    try {
      console.log('📤 Enviando transcrição...');

      await axios.post(
        `${this.evolutionApiUrl}/message/sendText/${instance}`,
        {
          number: jid,
          text,
        },
        {
          headers: {
            apikey: this.evolutionApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Transcrição enviada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar transcrição:', error);
      throw error;
    }
  }
}

// Exporta classes individuais
export { AudioTranscriber } from './transcriber.js';
export { OGRTFormatter } from './formatter.js';
export type { TranscriptionResult } from './transcriber.js';
export type { FormatterResult } from './formatter.js';
