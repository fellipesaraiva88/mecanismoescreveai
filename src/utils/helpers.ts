/**
 * Helpers úteis para processamento de dados
 */

import axios from 'axios';
import { createHash } from 'crypto';

/**
 * Utilitários de texto
 */
export const Text = {
  /**
   * Trunca texto para um tamanho máximo
   */
  truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Remove espaços extras e quebras de linha desnecessárias
   */
  clean(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Múltiplos espaços → 1 espaço
      .replace(/\n\s*\n/g, '\n') // Múltiplas quebras → 1 quebra
      .trim();
  },

  /**
   * Extrai números de um texto
   */
  extractNumbers(text: string): string[] {
    const matches = text.match(/\d+/g);
    return matches || [];
  },

  /**
   * Conta palavras
   */
  wordCount(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  },

  /**
   * Remove caracteres especiais
   */
  removeSpecialChars(text: string): string {
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Converte para slug
   */
  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Espaços → hífens
      .replace(/-+/g, '-') // Múltiplos hífens → 1 hífen
      .trim();
  },
};

/**
 * Utilitários de tempo
 */
export const Time = {
  /**
   * Espera X milissegundos
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Formata duração em segundos para formato legível
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  },

  /**
   * Retorna timestamp atual
   */
  now(): number {
    return Date.now();
  },

  /**
   * Converte timestamp para data legível
   */
  formatTimestamp(timestamp: number, locale: string = 'pt-BR'): string {
    return new Date(timestamp).toLocaleString(locale);
  },
};

/**
 * Utilitários de arquivo
 */
export const File = {
  /**
   * Baixa arquivo de uma URL
   */
  async download(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  },

  /**
   * Gera hash MD5 de um buffer
   */
  md5(data: Buffer | string): string {
    return createHash('md5').update(data).digest('hex');
  },

  /**
   * Converte buffer para base64
   */
  toBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  },

  /**
   * Converte base64 para buffer
   */
  fromBase64(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  },

  /**
   * Detecta tipo MIME de um buffer
   */
  detectMimeType(buffer: Buffer): string | null {
    // Magic numbers para tipos comuns
    const magicNumbers: Record<string, string> = {
      '89504e47': 'image/png',
      '47494638': 'image/gif',
      'ffd8ffe0': 'image/jpeg',
      'ffd8ffe1': 'image/jpeg',
      'ffd8ffe2': 'image/jpeg',
      '25504446': 'application/pdf',
      '504b0304': 'application/zip',
      '4f676753': 'audio/ogg',
    };

    const header = buffer.toString('hex', 0, 4);
    return magicNumbers[header] || null;
  },
};

/**
 * Utilitários de array
 */
export const Arrays = {
  /**
   * Divide array em chunks
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Remove duplicatas
   */
  unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  },

  /**
   * Embaralha array
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Pega item aleatório
   */
  random<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)];
  },
};

/**
 * Retry logic para operações que podem falhar
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

        if (onRetry) {
          onRetry(lastError, attempt);
        }

        await Time.sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Cache simples em memória
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();

  set(key: string, value: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get(key: string): T | undefined {
    const cached = this.cache.get(key);

    if (!cached) return undefined;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}
