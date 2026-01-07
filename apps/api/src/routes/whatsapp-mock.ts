import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { mockData } from '../lib/mock-data';

// QR Code mock (base64 de imagem PNG branca simples)
const MOCK_QR_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

interface SetupBody {
  tenantId: string;
}

interface StatusParams {
  tenantId: string;
}

interface SendMessageBody {
  tenantId: string;
  phone: string;
  message: string;
}

export async function whatsappRoutesMock(app: FastifyInstance) {
  /**
   * GET /health
   * Health check
   */
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      status: 'online',
      message: 'API WhatsApp funcionando',
      mode: 'mock',
    });
  });

  /**
   * POST /setup
   * Simula conexão WhatsApp
   */
  app.post<{ Body: SetupBody }>('/setup', async (
    request: FastifyRequest<{ Body: SetupBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { tenantId } = request.body;

      if (!tenantId) {
        return reply.status(400).send({
          success: false,
          error: 'tenantId é obrigatório',
        });
      }

      // Simula armazenar status
      (mockData.statuses as any)[tenantId] = {
        isConnected: false,
        evolutionId: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(),
      };

      return reply.send({
        success: true,
        base64: MOCK_QR_BASE64,
        qr: 'mock-qr-code',
        message: 'QR Code gerado (simulado)',
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Erro ao gerar QR Code',
      });
    }
  });

  /**
   * GET /status/:tenantId
   * Verifica status de conexão
   */
  app.get<{ Params: StatusParams }>('/status/:tenantId', async (
    request: FastifyRequest<{ Params: StatusParams }>,
    reply: FastifyReply
  ) => {
    try {
      const { tenantId } = request.params;

      const status = (mockData.statuses as any)[tenantId] || {
        isConnected: false,
        evolutionId: null,
        whatsappPhone: null,
      };

      return reply.send({
        success: true,
        isConnected: status.isConnected,
        evolutionId: status.evolutionId,
        whatsappPhone: status.whatsappPhone || null,
        connectedAt: status.connectedAt,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar status',
      });
    }
  });

  /**
   * POST /refresh-qr
   * Regenera QR Code
   */
  app.post<{ Body: SetupBody }>('/refresh-qr', async (
    request: FastifyRequest<{ Body: SetupBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { tenantId } = request.body;

      return reply.send({
        success: true,
        base64: MOCK_QR_BASE64,
        message: 'QR Code regenerado',
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Erro ao regenerar QR Code',
      });
    }
  });

  /**
   * POST /disconnect
   * Desconecta WhatsApp
   */
  app.post<{ Body: SetupBody }>('/disconnect', async (
    request: FastifyRequest<{ Body: SetupBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { tenantId } = request.body;

      if ((mockData.statuses as any)[tenantId]) {
        (mockData.statuses as any)[tenantId].isConnected = false;
      }

      return reply.send({
        success: true,
        message: 'WhatsApp desconectado',
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Erro ao desconectar',
      });
    }
  });

  /**
   * GET /instances
   * Lista todas as Evolution instances
   */
  app.get('/instances', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return reply.send({
        success: true,
        instances: mockData.instances,
        total: mockData.instances.length,
        message: 'Instances carregadas (simulado)',
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Erro ao listar instances',
      });
    }
  });

  /**
   * POST /send-message
   * Envia mensagem via WhatsApp
   */
  app.post<{ Body: SendMessageBody }>(
    '/send-message',
    async (request: FastifyRequest<{ Body: SendMessageBody }>, reply: FastifyReply) => {
      try {
        const { tenantId, phone, message } = request.body;

        return reply.send({
          success: true,
          messageId: 'msg-' + Date.now(),
          message: 'Mensagem enviada (simulado)',
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: 'Erro ao enviar mensagem',
        });
      }
    }
  );
}
