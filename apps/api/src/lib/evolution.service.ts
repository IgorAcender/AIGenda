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
   * Faz um POST/GET direto usando http/https nativo
   */
  private async makeHttpRequest(url: string, body: any, method: string = 'POST'): Promise<any> {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https');
      const httpModule = isHttps ? https : http;
      const urlObj = new URL(url);

      const postData = method === 'POST' && body ? JSON.stringify(body) : '';

      const headers: any = {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      };

      // Apenas adicione Content-Length para POST com dados
      if (method === 'POST' && postData) {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: headers,
      };

      console.log(`[HTTP Request] ${options.method} ${urlObj.hostname}:${options.port}${options.path}`);
      console.log(`[Headers] apikey: ${this.apiKey}`);

      const req = httpModule.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log(`[HTTP Response] Status: ${res.statusCode}`);
          try {
            const parsedData = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 400) {
              console.error(`[HTTP Error] ${res.statusCode}: ${JSON.stringify(parsedData)}`);
              reject(new Error(`HTTP ${res.statusCode}: ${parsedData?.error || parsedData?.message || 'Erro'}`));
            } else {
              console.log(`[HTTP Success] Data:`, parsedData);
              resolve(parsedData);
            }
          } catch (e) {
            reject(new Error(`Falha ao parsear resposta: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        console.error(`[HTTP Error] Connection error:`, e.message);
        reject(e);
      });

      if (method === 'POST' && postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * Gera um QR Code para conectar um novo WhatsApp
   * Inspirado no padrão robusto do projeto Rifas com retry logic
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
      
      console.log(`🔄 Verificando instância ${instanceName} na Evolution ${evolutionId}`);

      // PRIMEIRO: Verificar se instância já existe
      let instanceExists = false;
      try {
        const existingInstances = await this.makeHttpRequest(
          `${evolutionUrl}/instance/fetchInstances`,
          null,
          'GET'
        );
        instanceExists = existingInstances?.some((inst: any) => inst.name === instanceName) || false;
        console.log(`📋 Instância ${instanceName} ${instanceExists ? 'já existe' : 'não existe'}`);
      } catch (checkError) {
        console.log(`⚠️ Erro ao verificar instância existente:`, checkError);
      }

      // Criar instância APENAS se não existir
      if (!instanceExists) {
        try {
          console.log(`🔄 Criando nova instância ${instanceName}...`);
          await this.makeHttpRequest(
            `${evolutionUrl}/instance/create`,
            {
              instanceName,
              integration: 'WHATSAPP-BAILEYS',
              qrcode: true,
            }
          );
          console.log(`✅ Instância criada: ${instanceName}`);
        } catch (createError: any) {
          // Se erro 403 porque já existe, ignore e continue
          if (createError.message?.includes('already in use')) {
            console.log(`📋 Instância já existia (erro 403), continuando...`);
          } else {
            throw createError;
          }
        }
      }

      // Otimizado: RETRY LOGIC rápido (3 tentativas com delay curto)
      // A maioria dos casos resolve na 1ª tentativa
      const maxAttempts = 3; // Apenas 3 tentativas rápidas
      const delays = [200, 500, 1000]; // Delays progressivos: 200ms, 500ms, 1s
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const waitTime = delays[attempt - 1];
        
        console.log(`⏳ Tentativa ${attempt}/${maxAttempts} - Aguardando ${waitTime}ms para QR Code...`);
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        try {
          // Endpoint correto (copiado de Rifas): /instance/connect/{name}
          const qrData = await this.makeHttpRequest(
            `${evolutionUrl}/instance/connect/${instanceName}`,
            null,
            'GET'
          );

          // Verifica se obteve o QR code (Rifas retorna { base64, code })
          if (qrData && qrData.base64) {
            console.log(`✅ QR Code encontrado na tentativa ${attempt}!`);
            return {
              success: true,
              qr: qrData.base64,
              base64: qrData.base64,
              code: qrData.code || instanceName,
              message: 'QR Code gerado com sucesso',
            };
          }

          console.log(`⚠️ Tentativa ${attempt}: QR ainda não pronto (resposta: ${JSON.stringify(qrData)})`);
          
        } catch (qrError) {
          console.log(`⚠️ Tentativa ${attempt} erro:`, qrError instanceof Error ? qrError.message : qrError);
        }
      }

      // Se saiu do loop sem QR, retorna erro
      console.log(`❌ QR Code não foi gerado após ${maxAttempts} tentativas`);
      throw new Error('QR Code não foi gerado após múltiplas tentativas');

    } catch (error: any) {
      console.error(`❌ Erro ao criar instância:`, {
        message: error.message,
        url: process.env[`EVOLUTION_${evolutionId}_URL`],
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

      const response = await client.delete(`/instance/delete/${instanceName}`, {
        headers: {
          apikey: this.apiKey,
        },
      });

      return { success: response.data.status === 'SUCCESS' };
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
    state?: string;
    error?: string;
  }> {
    try {
      const client = this.getClient(evolutionId);
      const instanceName = `tenant-${tenantId}`;

      const response = await client.get(
        `/instance/connectionState/${instanceName}`,
        {
          headers: { apikey: this.apiKey },
        }
      );

      // Evolution pode retornar em formatos diferentes; normalizamos aqui
      const raw = response.data?.instance || response.data || {};
      const state =
        raw.state ||
        raw.status ||
        raw.connectionStatus ||
        raw.statusConnection ||
        (raw.connected ? 'open' : 'close');

      // Estados considerados conectados
      const connectedStates = ['open', 'connected', 'openfull'];
      const normalizedState = String(state || '').toLowerCase();
      const isConnected =
        connectedStates.includes(normalizedState) || raw.connected === true;

      // Tenta extrair número de telefone de várias localizações possíveis
      let phoneNumber =
        raw.phoneNumber ||
        raw.phone?.id ||
        raw.phone ||
        raw.wid ||
        raw.jid ||
        raw.number ||
        raw.webhookData?.phoneNumber ||
        raw.data?.phoneNumber ||
        raw.connection?.phoneNumber ||
        (typeof raw.phone === 'string' ? raw.phone : null);

      // Remove sufixo @s.whatsapp.net ou @g.us se existir (formato padrão do WhatsApp)
      if (phoneNumber && typeof phoneNumber === 'string') {
        phoneNumber = phoneNumber.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, '');
      }

      console.log(
        `[Evolution Status] Tenant ${tenantId}: connected=${isConnected}, state="${state}", phone="${phoneNumber || 'N/A'}"`
      );
      console.log(`[Evolution Raw Response] ${JSON.stringify(raw, null, 2)}`);

      return {
        isConnected,
        phoneNumber,
        state: state || (isConnected ? 'open' : 'close'),
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
   * Deleta uma instância na Evolution
   */
  async deleteInstance(
    evolutionUrl: string,
    instanceName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🗑️  Deletando instância ${instanceName} na Evolution...`);

      const response = await axios.delete(
        `${evolutionUrl}/instance/delete/${instanceName}`,
        {
          headers: {
            apikey: this.apiKey,
          },
        }
      );

      console.log(`✅ Instância ${instanceName} deletada com sucesso`);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao deletar instância ${instanceName}:`, error);
      // Não bloqueia o fluxo se falhar
      return { success: true };
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
   * Configura webhooks para uma instância na Evolution
   * Envia os eventos de CONNECTION_UPDATE para nosso servidor
   */
  async configureWebhook(
    evolutionUrl: string,
    instanceName: string,
    webhookUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔗 Configurando webhook para ${instanceName} em ${webhookUrl}`);

      await this.makeHttpRequest(
        `${evolutionUrl}/webhook/set/${instanceName}`,
        {
          webhook: {
            enabled: true,
            url: webhookUrl,
            events: ['CONNECTION_UPDATE', 'MESSAGES_UPDATE'],
          },
        }
      );

      console.log(`✅ Webhook configurado para ${instanceName}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Lista todos os status das Evolutions disponíveis e seus status
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
