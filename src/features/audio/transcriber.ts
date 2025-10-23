/**
 * Transcritor de áudio usando GROQ Whisper
 * Baseado no workflow Ultron do n8n
 */

import Groq from 'groq-sdk';
import axios from 'axios';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { WhatsAppWebhookPayload } from '../../types/webhook.js';

export interface AudioMessage {
  url: string;
  duration: number; // em segundos
  mimetype: string;
  size: number;
}

export interface TranscriptionResult {
  text: string;
  duration: number;
  language?: string;
}

export class AudioTranscriber {
  private groq: Groq;
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    this.groq = new Groq({ apiKey: groqKey });
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  /**
   * Verifica se uma mensagem é um áudio
   */
  static isAudioMessage(payload: WhatsAppWebhookPayload): boolean {
    return payload.data.messageType === 'audioMessage';
  }

  /**
   * Extrai informações do áudio
   */
  static extractAudioInfo(payload: WhatsAppWebhookPayload): AudioMessage | null {
    const data = payload.data;

    if (data.messageType !== 'audioMessage') {
      return null;
    }

    const audioMsg = data.message?.audioMessage;
    if (!audioMsg) {
      return null;
    }

    return {
      url: audioMsg.url,
      duration: audioMsg.seconds || 0,
      mimetype: audioMsg.mimetype || 'audio/ogg',
      size: parseInt(audioMsg.fileLength || '0'),
    };
  }

  /**
   * Baixa o áudio do Evolution API
   */
  private async downloadAudio(
    messageId: string,
    instance: string = 'saraiva'
  ): Promise<string> {
    try {
      // URL da Evolution API para baixar mídia
      const url = `${this.evolutionApiUrl}/message/downloadMedia/${instance}`;

      console.log('📥 Baixando áudio...');

      const response = await axios.post(
        url,
        {
          id: messageId,
          convertToMp4: false,
        },
        {
          headers: {
            apikey: this.evolutionApiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      // Salva temporariamente
      const tempPath = join(tmpdir(), `audio_${messageId}.ogg`);
      await writeFile(tempPath, response.data);

      console.log(`✅ Áudio salvo: ${tempPath}`);
      return tempPath;
    } catch (error) {
      console.error('❌ Erro ao baixar áudio:', error);
      throw new Error('Falha ao baixar áudio do WhatsApp');
    }
  }

  /**
   * Transcreve áudio usando GROQ Whisper
   */
  private async transcribeWithGroq(audioPath: string): Promise<string> {
    try {
      console.log('🎙️ Transcrevendo com GROQ Whisper...');

      const transcription = await this.groq.audio.transcriptions.create({
        file: await import('fs').then((fs) =>
          fs.createReadStream(audioPath)
        ),
        model: 'whisper-large-v3',
        language: 'pt', // Português
        response_format: 'json',
        temperature: 0.0,
      });

      console.log('✅ Transcrição concluída');
      return transcription.text;
    } catch (error) {
      console.error('❌ Erro ao transcrever:', error);
      throw new Error('Falha na transcrição do áudio');
    }
  }

  /**
   * Transcreve uma mensagem de áudio completa
   */
  async transcribe(
    payload: WhatsAppWebhookPayload,
    instance: string = 'saraiva'
  ): Promise<TranscriptionResult> {
    const audioInfo = AudioTranscriber.extractAudioInfo(payload);

    if (!audioInfo) {
      throw new Error('Mensagem não contém áudio válido');
    }

    console.log(`\n🎵 ================================`);
    console.log(`🎵   TRANSCREVENDO ÁUDIO`);
    console.log(`🎵 ================================`);
    console.log(`⏱️  Duração: ${audioInfo.duration}s`);
    console.log(`📦 Tamanho: ${(audioInfo.size / 1024).toFixed(2)} KB`);

    let audioPath: string | null = null;

    try {
      // 1. Baixa o áudio
      const messageId = payload.data.key.id || '';
      audioPath = await this.downloadAudio(messageId, instance);

      // 2. Transcreve com GROQ
      const text = await this.transcribeWithGroq(audioPath);

      console.log(`\n✅ Transcrição:`);
      console.log(`   "${text.substring(0, 100)}..."`);
      console.log(`\n🎵 ================================\n`);

      return {
        text,
        duration: audioInfo.duration,
        language: 'pt',
      };
    } finally {
      // Limpa arquivo temporário
      if (audioPath) {
        try {
          await unlink(audioPath);
          console.log('🗑️  Arquivo temporário removido');
        } catch (error) {
          console.warn('⚠️  Erro ao remover arquivo temporário:', error);
        }
      }
    }
  }
}
