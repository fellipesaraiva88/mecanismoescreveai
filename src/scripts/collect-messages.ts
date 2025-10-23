/**
 * Script para coletar todas as mensagens do WhatsApp
 * Uso: npm run collect-messages
 */

import 'dotenv/config';
import { MessageCollector } from '../features/analytics/collector.js';

async function main() {
  const collector = new MessageCollector();

  try {
    // Coleta mensagens da instância principal
    await collector.collectAllMessages('saraiva');

    console.log('✅ Coleta finalizada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na coleta:', error);
    process.exit(1);
  } finally {
    await collector.close();
  }
}

main();
