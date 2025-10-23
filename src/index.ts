/**
 * EscreverAI - Sistema modular de workflows
 *
 * Exemplo de uso do servidor de webhooks com o workflow Ultron
 */

import 'dotenv/config';
import { WebhookServer } from './server/webhook.js';
import { WhatsAppClient } from './integrations/whatsapp.js';
import {
  initializeJarvis,
  handleJarvisWebhook,
  getJarvisStats,
} from './examples/jarvis-bot.js';

const PORT = parseInt(process.env.PORT || '3000');

// Cliente WhatsApp
const whatsapp = new WhatsAppClient(
  process.env.EVOLUTION_API_URL || '',
  process.env.EVOLUTION_API_KEY || '',
  'saraiva'
);

async function main() {
  console.log('🚀 Iniciando EscreverAI com Jarvis...\n');

  // Inicializa Jarvis
  initializeJarvis();

  // Cria servidor de webhooks
  const server = new WebhookServer(PORT);

  // Configura health check
  server.setupHealthCheck('/health');

  // Webhook principal do Jarvis
  server.onWhatsApp('/webhook/jarvis', async (payload, req, res) => {
    console.log(`\n📨 Mensagem recebida do WhatsApp`);
    console.log(`   Evento: ${payload.event}`);
    console.log(`   Instance: ${payload.instance}`);
    console.log(`   Sender: ${payload.sender}`);
    console.log(`   Type: ${payload.data.messageType}\n`);

    try {
      await handleJarvisWebhook(payload, whatsapp);

      res.status(200).json({
        success: true,
        message: 'Processado pelo Jarvis',
      });
    } catch (error) {
      console.error('❌ Erro no Jarvis:', error);

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  // Endpoint de stats do Jarvis
  server.registerWebhook({
    path: '/stats',
    method: 'GET',
    handler: async (payload, req, res) => {
      const stats = getJarvisStats();

      res.json({
        success: true,
        stats,
        text: stats,
      });
    },
  });

  // Exemplo de webhook simples (mantido para testes)
  server.registerWebhook({
    path: '/webhook/test',
    method: 'POST',
    handler: async (payload, req, res) => {
      console.log('Webhook de teste recebido:', payload);

      res.json({
        message: 'Teste recebido!',
        data: payload,
      });
    },
  });

  // Inicia o servidor
  await server.start();

  console.log('\n✅ Jarvis está online e funcionando!\n');
  console.log('📡 Endpoints disponíveis:');
  console.log(`  🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`  🤖 Jarvis Webhook: http://localhost:${PORT}/webhook/jarvis`);
  console.log(`  📊 Stats: http://localhost:${PORT}/stats`);
  console.log(`  🧪 Test: http://localhost:${PORT}/webhook/test\n`);

  console.log('💡 Configure o webhook do Evolution API:');
  console.log(`   URL: http://localhost:${PORT}/webhook/jarvis\n`);

  console.log('🎯 Comandos disponíveis no WhatsApp:');
  console.log('   /ajuda - Ver todos os comandos');
  console.log('   /ping - Testar bot');
  console.log('   /grupos - Gerenciar grupos (admin)\n');

  console.log('🎨 Reações disponíveis:');
  console.log('   🔊 = Transcrever áudio');
  console.log('   📌 = Salvar mensagem');
  console.log('   📝 = Resumir thread');
  console.log('   ❓ = Explicar contexto\n');
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Inicia a aplicação
main().catch((error) => {
  console.error('❌ Erro ao iniciar aplicação:', error);
  process.exit(1);
});
