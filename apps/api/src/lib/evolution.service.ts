import axios, { AxiosInstance } from 'axios';
import * as http from 'http';
import * as https from 'https';

interface EvolutionInstance {
  id: number;
  name: string;
  url: string;
  maxConnections: number;
}

interface QRCodeResponse {
  qr?: string;
  code?: string;
  base64?: string;
  success?: boolean;
  message?: string;
}

interface GenerateInstanceResponse {
  success: boolean;
  instanceId?: string;
  message?: string;
}

/**
 * Serviço para gerenciar a comunicação com as APIs da Evolution
 * Responsável por:
 * - Conectar às Evolutions
 * - Gerar QR Codes
 * - Enviar mensagens
 * - Gerenciar instâncias
 */
export class EvolutionService {
  private evolutionInstances: Map<number, AxiosInstance> = new Map();
  private apiKey: string;

  constructor(apiKey: string = process.env.EVOLUTION_API_KEY || '') {
    this.apiKey = apiKey;
    console.log(`🔑 Evolution API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NÃO DEFINIDA'}`);
    this.initializeInstances();
  }

  /**
   * Inicializa clientes HTTP para cada Evolution
   */
  private initializeInstances() {
    for (let i = 1; i <= 10; i++) {
      const url = process.env[`EVOLUTION_${i}_URL`];
      if (url) {
        const client = axios.create({
          baseURL: url,
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            // Evolution v2.2.3 espera header `apikey`
            apikey: this.apiKey,
          },
        });
        this.evolutionInstances.set(i, client);
      }
    }
  }

  /**
   * Obtém o cliente HTTP de uma Evolution específica
   */
  private getClient(evolutionId: number): AxiosInstance {
    const client = this.evolutionInstances.get(evolutionId);
    if (!client) {
      throw new Error(`Evolution ${evolutionId} não está disponível`);
    }
    return client;
  }

  /**
   * Faz um POST direto usando http/https nativo
   */
  private async makeHttpRequest(url: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https');
      const httpModule = isHttps ? https : http;
      const urlObj = new URL(url);

      const postData = JSON.stringify(body);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = httpModule.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${parsedData?.error || parsedData?.message || 'Erro'}`));
            } else {
              resolve(parsedData);
            }
          } catch (e) {
            reject(new Error(`Falha ao parsear resposta: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Gera um QR Code para conectar um novo WhatsApp
   * Na v2.2.3, apenas cria a instância (QR será obtido via webhook)
   * NOTA: Usando http/https nativo por compatibilidade com Evolution API
   */
  async generateQRCode(
    evolutionId: number,
    tenantId: string
  ): Promise<QRCodeResponse> {
    try {
      const evolutionUrl = process.env[`EVOLUTION_${evolutionId}_URL`];
      if (!evolutionUrl) {
        throw new Error(`Evolution ${evolutionId} URL não configurada`);
      }

      const instanceName = `tenant-${tenantId}`;
      
      console.log(`🔄 Criando instância ${instanceName} na Evolution ${evolutionId} (${evolutionUrl})`);
      console.log(`🔑 Usando API Key: ${this.apiKey.substring(0, 10)}...`);

      // Faz o request usando http/https nativo
      const data = await this.makeHttpRequest(
        `${evolutionUrl}/instance/create`,
        {
          instanceName,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: true,
        }
      );

      console.log(`✅ Instância criada: ${instanceName}`);

      // Retorna sucesso - o QR será enviado via webhook quando pronto
      return {
        success: true,
        code: `Instance ${instanceName} created`,
        message: 'Aguarde alguns segundos para o QR Code aparecer...',
      };

    } catch (error: any) {
      console.error(`❌ Erro ao criar instância Evolution ${evolutionId}:`, {
        message: error.message,
      });

      throw new Error(
        `Falha ao gerar QR Code: ${error.message}`
      );
    }
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   */
  async sendMessage(
    evolutionId: number,
    tenantId: string,
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const client = this.getClient(evolutionId);
      const instanceName = `tenant-${tenantId}`;

      const response = await client.post('/message/send', {
        number: phoneNumber,
        text: message,
        instance: instanceName,
        apikey: this.apiKey,
      });

      return {
        success: response.data.success,
        messageId: response.data.messageId,
      };
    } catch (error) {
      console.error(
        `Erro ao enviar mensagem na Evolution ${evolutionId}:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Desconecta um WhatsApp
   */
  async disconnect(
    evolutionId: number,
    tenantId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const client = this.getClient(evolutionId);
      const instanceName = `tenant-${tenantId}`;

      const response = await client.post('/disconnect', {
        instance: instanceName,
        apikey: this.apiKey,
      });

      return { success: response.data.success };
    } catch (error) {
      console.error(
        `Erro ao desconectar na Evolution ${evolutionId}:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Obtém o status de conexão de um WhatsApp
   */
  async getStatus(
    evolutionId: number,
    tenantId: string
  ): Promise<{
    isConnected: boolean;
    phoneNumber?: string;
    error?: string;
  }> {
    try {
      const client = this.getClient(evolutionId);
      const instanceName = `tenant-${tenantId}`;

      const response = await client.get(`/message/check-number/${instanceName}`, {
        headers: { apikey: this.apiKey },
      });

      return {
        isConnected: response.data.success,
        phoneNumber: response.data.phoneNumber,
      };
    } catch (error) {
      console.error(
        `Erro ao verificar status na Evolution ${evolutionId}:`,
        error
      );
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia uma mensagem de template
   */
  async sendTemplate(
    evolutionId: number,
    tenantId: string,
    phoneNumber: string,
    templateId: string,
    variables: string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const client = this.getClient(evolutionId);
      const instanceName = `tenant-${tenantId}`;

      const response = await client.post('/message/send-template', {
        number: phoneNumber,
        template_id: templateId,
        variables: variables,
        instance: instanceName,
        apikey: this.apiKey,
      });

      return {
        success: response.data.success,
        messageId: response.data.messageId,
      };
    } catch (error) {
      console.error(
        `Erro ao enviar template na Evolution ${evolutionId}:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Verifica saúde de uma Evolution
   */
  async healthCheck(evolutionId: number): Promise<boolean> {
    try {
      const client = this.getClient(evolutionId);
      const response = await client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Lista todas as Evolutions disponíveis e seus status
   */
  async getAllStatus(): Promise<
    Array<{ id: number; healthy: boolean; error?: string }>
  > {
    const results: Array<{
      id: number;
      healthy: boolean;
      error?: string;
    }> = [];

    for (const [id] of this.evolutionInstances) {
      const healthy = await this.healthCheck(id);
      results.push({
        id,
        healthy,
        error: healthy ? undefined : 'Evolution não respondeu',
      });
    }

    return results;
  }
}

// Singleton instance
let evolutionService: EvolutionService;

export function getEvolutionService(): EvolutionService {
  if (!evolutionService) {
    evolutionService = new EvolutionService();
  }
  return evolutionService;
}
