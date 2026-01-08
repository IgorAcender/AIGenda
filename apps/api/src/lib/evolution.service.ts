import axios, { AxiosInstance } from 'axios';

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
   * Gera um QR Code para conectar um novo WhatsApp
   * Na v2.2.3, o QR Code é gerado assincronamente via polling
   */
  async generateQRCode(
    evolutionId: number,
    tenantId: string
  ): Promise<QRCodeResponse> {
    try {
      const client = this.getClient(evolutionId);
      const instanceName = `tenant-${tenantId}`;

      // Tenta criar a instância
      try {
        await client.post(
          '/instance/create',
          {
            instanceName,
            integration: 'WHATSAPP-BAILEYS',
            qrcode: true,
          },
          {
            headers: { apikey: this.apiKey },
          }
        );
      } catch (error: any) {
        // Se a instância já existe, continua
        if (error.response?.status !== 400) {
          throw error;
        }
      }

      // Aguarda o QR Code com polling (máx 30 segundos)
      const maxAttempts = 30;
      const delayMs = 1000;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          // Tenta obter a lista de instâncias e procura pela nossa
          const instancesResponse = await client.get('/instance/fetchInstances', {
            headers: { apikey: this.apiKey },
          });
          
          const instances = instancesResponse.data || [];
          const instance = instances.find((inst: any) => inst.name === instanceName);
          
          if (instance && instance.connectionStatus === 'connecting') {
            // Tenta obter o QR Code via diferentes endpoints
            
            // Endpoint 1: /chat/getBase64Qrcode
            try {
              const qrResponse = await client.get(
                `/chat/getBase64Qrcode/${instanceName}`,
                { headers: { apikey: this.apiKey } }
              );
              if (qrResponse.data?.base64) {
                return {
                  base64: qrResponse.data.base64,
                  code: qrResponse.data.code,
                  qr: qrResponse.data.qr,
                  success: true,
                };
              }
            } catch (e) {
              // Endpoint não disponível, continua tentando
            }

            // Endpoint 2: /instance/connect (pode retornar QR no futuro)
            try {
              const connectResponse = await client.get(
                `/instance/connect/${instanceName}`,
                { headers: { apikey: this.apiKey } }
              );
              const data = connectResponse.data || {};
              if (data.base64) {
                return {
                  base64: data.base64,
                  code: data.code,
                  qr: data.qr,
                  success: true,
                };
              }
            } catch (e) {
              // Continua polling
            }
          }
        } catch (error) {
          // Continua tentando
          console.log(`Polling tentativa ${attempt + 1}/${maxAttempts} para ${instanceName}`);
        }

        // Aguarda antes da próxima tentativa
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      // Se chegou aqui, o QR Code não foi obtido, mas a instância foi criada
      // Retorna sucesso sem o QR Code (será obtido via webhook mais tarde)
      return {
        success: true,
        code: `Instance ${instanceName} created. QR Code will be available via webhook.`,
      };

    } catch (error) {
      console.error(
        `Erro ao gerar QR Code na Evolution ${evolutionId}:`,
        error
      );
      throw new Error(
        `Falha ao gerar QR Code: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
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
