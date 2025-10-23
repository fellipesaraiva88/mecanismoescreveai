/**
 * Sistema de Menções
 * Orquestra detecção, processamento e execução de menções ao bot
 */

import type { WhatsAppWebhookPayload } from '../../types/webhook.js';
import { MentionDetector } from './detector.js';
import { IntentProcessor } from './processor.js';
import { ActionExecutor } from './executor.js';

export class MentionSystem {
  private processor: IntentProcessor;
  private executor: ActionExecutor;

  constructor() {
    this.processor = new IntentProcessor();
    this.executor = new ActionExecutor();
  }

  /**
   * Verifica se o webhook é uma menção ao bot
   */
  isMention(payload: WhatsAppWebhookPayload): boolean {
    return MentionDetector.isMention(payload);
  }

  /**
   * Processa uma menção ao bot
   */
  async processMention(
    payload: WhatsAppWebhookPayload,
    instance: string = 'saraiva'
  ): Promise<void> {
    console.log('\n💬 ================================');
    console.log('💬   MENÇÃO AO BOT DETECTADA');
    console.log('💬 ================================\n');

    // Extrai evento de menção
    const mention = MentionDetector.extractMentionEvent(payload);

    if (!mention) {
      console.log('❌ Não foi possível extrair evento de menção');
      return;
    }

    console.log(`👤 Usuário: ${mention.sender}`);
    console.log(`💬 Texto: ${mention.text}`);
    console.log(`🎯 Pedido: ${mention.request}`);

    try {
      // Identifica a intenção
      console.log('\n🤔 Processando intenção...');
      const intent = await this.processor.processRequest(mention);

      console.log(`✅ Intenção identificada: ${intent.type}`);
      console.log(
        `   Confiança: ${(intent.confidence * 100).toFixed(0)}%`
      );

      // Executa a ação
      console.log('\n⚡ Executando ação...');
      const result = await this.executor.execute(intent, mention);

      if (result.success) {
        console.log('✅ Ação executada com sucesso');

        // Envia resposta
        await this.executor.sendResponse(
          mention.jid,
          result.response,
          instance
        );
      } else {
        console.log(`❌ Erro ao executar ação: ${result.error}`);

        // Envia mensagem de erro
        await this.executor.sendResponse(
          mention.jid,
          result.response,
          instance
        );
      }
    } catch (error) {
      console.error('❌ Erro ao processar menção:', error);

      // Envia mensagem de erro genérica
      try {
        await this.executor.sendResponse(
          mention.jid,
          '❌ Desculpe, ocorreu um erro ao processar seu pedido. Tente novamente mais tarde.',
          instance
        );
      } catch (sendError) {
        console.error('❌ Erro ao enviar mensagem de erro:', sendError);
      }
    }

    console.log('\n💬 ================================\n');
  }
}

// Exporta classes individuais
export { MentionDetector } from './detector.js';
export { IntentProcessor } from './processor.js';
export { ActionExecutor } from './executor.js';
export type { MentionEvent } from './detector.js';
export type { Intent, IntentType } from './processor.js';
export type { ExecutionResult } from './executor.js';
