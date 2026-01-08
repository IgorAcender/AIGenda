import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getEvolutionAllocationService } from '../lib/evolution-allocation.service';
import { getEvolutionService } from '../lib/evolution.service';
import { prisma } from '../lib/prisma';

const allocationService = getEvolutionAllocationService();
const evolutionService = getEvolutionService();

export async function whatsappRoutes(app: FastifyInstance) {
  /**
   * POST /setup
   * Aloca um tenant à uma Evolution disponível e gera QR Code
   */
  app.post<{ Body: { tenantId: string } }>('/setup', async (
    request: FastifyRequest<{ Body: { tenantId: string } }>,
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

      // Aloca tenant à Evolution
      const allocation = await allocationService.allocateTenantToEvolution(
        tenantId
      );

      if (!allocation.success) {
        return reply.status(400).send({
          success: false,
          error: allocation.error,
        });
      }

      // Gera QR Code
      const qrCode = await allocationService.generateQRCodeForTenant(tenantId);

      if (!qrCode.success) {
        return reply.status(400).send({
          success: false,
          error: qrCode.error,
        });
      }

      return reply.send({
        success: true,
        qr: qrCode.qr,
        code: qrCode.code,
        base64: qrCode.base64,
        evolutionId: allocation.evolutionId,
        message: 'QR Code gerado com sucesso. Escaneie com seu WhatsApp.',
      });
    } catch (error) {
      console.error('Erro em /whatsapp/setup:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * POST /refresh-qr
   * Regenera o QR Code para um tenant
   */
  app.post<{ Body: { tenantId: string } }>('/refresh-qr', async (
    request: FastifyRequest<{ Body: { tenantId: string } }>,
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

      const qrCode = await allocationService.generateQRCodeForTenant(tenantId);

      if (!qrCode.success) {
        return reply.status(400).send({
          success: false,
          error: qrCode.error,
        });
      }

      return reply.send({
        success: true,
        qr: qrCode.qr,
        code: qrCode.code,
        base64: qrCode.base64,
        message: 'QR Code regenerado com sucesso',
      });
    } catch (error) {
      console.error('Erro em /whatsapp/refresh-qr:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * GET /status/:tenantId
   * Obtém status da conexão WhatsApp de um tenant
   */
  app.get<{ Params: { tenantId: string } }>('/status/:tenantId', async (
    request: FastifyRequest<{ Params: { tenantId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { tenantId } = request.params;

      const status = await allocationService.getTenantEvolutionStatus(tenantId);

      if (!status.success) {
        return reply.status(404).send(status);
      }

      return reply.send(status);
    } catch (error) {
      console.error('Erro em /whatsapp/status:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * POST /send-message
   * Envia uma mensagem WhatsApp de um tenant
   */
  app.post<{
    Body: { tenantId: string; phoneNumber: string; message: string };
  }>('/send-message', async (request: FastifyRequest<{ Body: { tenantId: string; phoneNumber: string; message: string } }>, reply: FastifyReply) => {
    try {
      const { tenantId, phoneNumber, message } = request.body;

      if (!tenantId || !phoneNumber || !message) {
        return reply.status(400).send({
          success: false,
          error: 'tenantId, phoneNumber e message são obrigatórios',
        });
      }

      // Obtém mapping
      const mapping = await (prisma as any).tenantEvolutionMapping.findUnique({
        where: { tenantId },
      });

      if (!mapping) {
        return reply.status(404).send({
          success: false,
          error: 'Tenant não encontrado',
        });
      }

      if (!mapping.isConnected) {
        return reply.status(400).send({
          success: false,
          error: 'WhatsApp não está conectado',
        });
      }

      // Envia mensagem
      const result = await evolutionService.sendMessage(
        mapping.evolutionInstanceId,
        tenantId,
        phoneNumber,
        message
      );

      return reply.send(result);
    } catch (error) {
      console.error('Erro em /whatsapp/send-message:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * POST /disconnect
   * Desconecta WhatsApp de um tenant
   */
  app.post<{ Body: { tenantId: string } }>('/disconnect', async (
    request: FastifyRequest<{ Body: { tenantId: string } }>,
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

      const result = await allocationService.deleteTenantEvolutionConnection(
        tenantId
      );

      return reply.send(result);
    } catch (error) {
      console.error('Erro em /whatsapp/disconnect:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * GET /instances
   * Lista todas as Evolution instances
   */
  app.get('/instances', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await allocationService.getAllEvolutionStatus();
      return reply.send(result);
    } catch (error) {
      console.error('Erro em /whatsapp/instances:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * GET /health
   * Verifica saúde de todas as Evolution instances
   */
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await evolutionService.getAllStatus();
      const allHealthy = health.every((h) => h.healthy);

      return reply.status(allHealthy ? 200 : 503).send({
        success: allHealthy,
        instances: health,
      });
    } catch (error) {
      console.error('Erro em /whatsapp/health:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  // ============= WEBHOOKS =============

  /**
   * POST /webhooks/evolution/connected
   */
  app.post<{ Body: { instance: string; data: any } }>(
    '/webhooks/evolution/connected',
    async (request: FastifyRequest<{ Body: { instance: string; data: any } }>, reply: FastifyReply) => {
      try {
        const { instance, data } = request.body;

        if (!instance) {
          return reply.status(400).send({
            success: false,
            error: 'instance é obrigatório',
          });
        }

        const tenantId = instance.replace('tenant-', '');
        console.log(`[WEBHOOK] WhatsApp conectado para tenant: ${tenantId}`);

        const result = await allocationService.handleTenantConnected(
          tenantId,
          data?.phoneNumber
        );

        if (!result.success) {
          return reply.status(400).send(result);
        }

        return reply.send({
          success: true,
          message: `Tenant ${tenantId} conectado com sucesso`,
        });
      } catch (error) {
        console.error('Erro em webhook connected:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }
  );

  /**
   * POST /webhooks/evolution/disconnected
   */
  app.post<{ Body: { instance: string; data: any } }>(
    '/webhooks/evolution/disconnected',
    async (request: FastifyRequest<{ Body: { instance: string; data: any } }>, reply: FastifyReply) => {
      try {
        const { instance, data } = request.body;

        if (!instance) {
          return reply.status(400).send({
            success: false,
            error: 'instance é obrigatório',
          });
        }

        const tenantId = instance.replace('tenant-', '');
        console.log(`[WEBHOOK] WhatsApp desconectado para tenant: ${tenantId}`);

        const result = await allocationService.handleTenantDisconnected(tenantId);

        if (!result.success) {
          return reply.status(400).send(result);
        }

        return reply.send({
          success: true,
          message: `Tenant ${tenantId} desconectado`,
        });
      } catch (error) {
        console.error('Erro em webhook disconnected:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }
  );

  /**
   * POST /webhooks/evolution/messages
   */
  app.post<{ Body: { instance: string; data: any } }>(
    '/webhooks/evolution/messages',
    async (request: FastifyRequest<{ Body: { instance: string; data: any } }>, reply: FastifyReply) => {
      try {
        const { instance, data } = request.body;

        if (!instance || !data) {
          return reply.status(400).send({
            success: false,
            error: 'instance e data são obrigatórios',
          });
        }

        const tenantId = instance.replace('tenant-', '');
        console.log(
          `[WEBHOOK] Mensagem recebida para tenant ${tenantId} de ${data.sender}`
        );

        return reply.send({
          success: true,
          message: 'Mensagem processada',
        });
      } catch (error) {
        console.error('Erro em webhook messages:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }
  );
}
