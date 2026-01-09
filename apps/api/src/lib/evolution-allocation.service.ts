import { prisma } from './prisma';
import { getEvolutionService } from './evolution.service';

export const EVOLUTION_INSTANCES_COUNT = 10;
export const MAX_TENANTS_PER_EVOLUTION = 100;

interface AllocationResult {
  success: boolean;
  evolutionId?: number;
  evolutionUrl?: string;
  error?: string;
}

interface QRCodeResult {
  success: boolean;
  qr?: string;
  code?: string;
  base64?: string;
  error?: string;
}

/**
 * Serviço de alocação de tenants para as instâncias da Evolution
 * Responsável por:
 * - Encontrar Evolution disponível com menos tenants
 * - Alocar novo tenant
 * - Gerar QR Code
 * - Gerenciar conexões de tenants
 */
export class EvolutionAllocationService {
  /**
   * Encontra a instância Evolution com menos tenants conectados
   * Usa estratégia de hash para distribuição consistente
   */
  async findAvailableEvolutionInstance(): Promise<{
    evolutionId: number;
    url: string;
  } | null> {
    // Tenta encontrar instância com menos tenants
    const evolution = await prisma.evolutionInstance.findFirst({
      orderBy: {
        tenantCount: 'asc',
      },
      where: {
        tenantCount: {
          lt: MAX_TENANTS_PER_EVOLUTION,
        },
        isActive: true,
      },
    });

    if (!evolution) {
      return null;
    }

    return {
      evolutionId: evolution.id,
      url: evolution.url,
    };
  }

  /**
   * Aloca um novo tenant à Evolution disponível
   */
  async allocateTenantToEvolution(tenantId: string): Promise<AllocationResult> {
    try {
      // Verifica se tenant já foi alocado
      const existing = await prisma.tenantEvolutionMapping.findUnique({
        where: {
          tenantId,
        },
      });

      if (existing) {
        return {
          success: true,
          evolutionId: existing.evolutionInstanceId,
          error: 'Tenant já alocado',
        };
      }

      // Valida se o tenant existe para evitar erro de FK na criação do mapping
      const tenantExists = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true },
      });

      if (!tenantExists) {
        return {
          success: false,
          error: 'Tenant não encontrado. Verifique o ID usado pelo frontend',
        };
      }

      // Encontra Evolution disponível
      const available = await this.findAvailableEvolutionInstance();

      if (!available) {
        return {
          success: false,
          error: 'Nenhuma Evolution disponível com espaço',
        };
      }

      // Cria mapeamento do tenant para Evolution
      const mapping = await prisma.tenantEvolutionMapping.create({
        data: {
          tenantId,
          evolutionInstanceId: available.evolutionId,
          isConnected: false,
        },
      });

      // Incrementa contador de tenants na Evolution
      await prisma.evolutionInstance.update({
        where: { id: available.evolutionId },
        data: {
          tenantCount: {
            increment: 1,
          },
        },
      });

      // Configura webhooks para este tenant (não bloqueia alocação se falhar)
      const evolutionService = getEvolutionService();
      const instanceName = `tenant-${tenantId}`;
      // Usa host.docker.internal para que o container Docker consiga acessar a API na máquina host
      const webhookHost = process.env.WEBHOOK_HOST || 'http://host.docker.internal:3001';
      const webhookUrl = `${webhookHost}/api/whatsapp/webhooks/evolution/connected`;
      
      try {
        await evolutionService.configureWebhook(available.url, instanceName, webhookUrl);
        console.log(`✅ Webhook configurado para ${instanceName}: ${webhookUrl}`);
      } catch (webhookError) {
        console.warn(`⚠️ Falha ao configurar webhook para ${instanceName}:`, webhookError);
        // Não bloqueia a alocação se webhook falhar
      }

      return {
        success: true,
        evolutionId: available.evolutionId,
        evolutionUrl: available.url,
      };
    } catch (error) {
      console.error('Erro ao alocar tenant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Gera QR Code para tenant conectar seu WhatsApp
   */
  async generateQRCodeForTenant(tenantId: string): Promise<QRCodeResult> {
    try {
      // Obtém Evolution alocada para este tenant
      const mapping = await prisma.tenantEvolutionMapping.findUnique({
        where: { tenantId },
        include: {
          evolutionInstance: true,
        },
      });

      if (!mapping || !mapping.evolutionInstance) {
        return {
          success: false,
          error: 'Tenant não está alocado a nenhuma Evolution',
        };
      }

      // Gera QR Code na Evolution
      const evolutionService = getEvolutionService();
      const instanceName = `tenant-${tenantId}`;
      let qrCodeResponse = await evolutionService.generateQRCode(
        mapping.evolutionInstanceId,
        tenantId
      );

      // Se falhar, tenta deletar e recriar a instância
      if (!qrCodeResponse.success) {
        console.log(`⚠️  Falha ao gerar QR Code na primeira tentativa. Deletando instância e recriando...`);
        
        // Deleta a instância antiga
        await evolutionService.deleteInstance(
          mapping.evolutionInstance.url,
          instanceName
        );

        // Aguarda um pouco para garantir a deleção
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Tenta gerar novamente
        qrCodeResponse = await evolutionService.generateQRCode(
          mapping.evolutionInstanceId,
          tenantId
        );
      }

      if (qrCodeResponse.success) {
        // Atualiza timestamp de tentativa
        await prisma.tenantEvolutionMapping.update({
          where: { tenantId },
          data: {
            lastQRCodeGeneratedAt: new Date(),
          },
        });
      }

      return {
        success: qrCodeResponse.success || false,
        qr: qrCodeResponse.qr,
        code: qrCodeResponse.code,
        base64: qrCodeResponse.base64,
        error: qrCodeResponse.success ? undefined : 'Falha ao gerar QR Code',
      };
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Marca tenant como conectado quando webhook chega
   */
  async handleTenantConnected(
    tenantId: string,
    whatsappPhoneNumber?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[handleTenantConnected] Iniciando para tenantId: "${tenantId}"`);
      
      // Se não recebeu o número no webhook, tenta consultar direto na Evolution
      let phoneToSave = whatsappPhoneNumber;
      if (!phoneToSave) {
        try {
          const mapping = await prisma.tenantEvolutionMapping.findUnique({
            where: { tenantId },
          });
          
          if (mapping) {
            const evolutionService = getEvolutionService();
            const liveStatus = await evolutionService.getStatus(
              mapping.evolutionInstanceId,
              tenantId
            );
            
            if (liveStatus?.phoneNumber && liveStatus.phoneNumber !== 'N/A') {
              phoneToSave = liveStatus.phoneNumber;
              console.log(`[handleTenantConnected] Número recuperado da Evolution: ${phoneToSave}`);
            }
          }
        } catch (statusError) {
          console.error(`[handleTenantConnected] Erro ao consultar status na Evolution:`, statusError);
        }
      }
      
      const mapping = await prisma.tenantEvolutionMapping.update({
        where: { tenantId },
        data: {
          isConnected: true,
          whatsappPhoneNumber: phoneToSave,
          connectedAt: new Date(),
          disconnectedAt: null,
        },
      });

      console.log(`✅ Tenant ${tenantId} conectado (${phoneToSave || 'sem telefone'})`);
      console.log(`[handleTenantConnected] Banco atualizado com sucesso para tenantId: "${tenantId}"`);

      return { success: true };
    } catch (error) {
      console.error(`[handleTenantConnected] Erro para tenantId "${tenantId}":`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Marca tenant como desconectado quando webhook chega
   */
  async handleTenantDisconnected(tenantId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const mapping = await prisma.tenantEvolutionMapping.update({
        where: { tenantId },
        data: {
          isConnected: false,
          disconnectedAt: new Date(),
        },
      });

      console.log(`❌ Tenant ${tenantId} desconectado`);

      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar tenant como desconectado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Remove completamente um tenant da Evolution
   * Desconecta, remove da Evolution, limpa mapeamento e decrementa contador
   */
  async deleteTenantEvolutionConnection(tenantId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Obtém mapeamento
      const mapping = await prisma.tenantEvolutionMapping.findUnique({
        where: { tenantId },
        include: {
          evolutionInstance: true,
        },
      });

      if (!mapping) {
        return {
          success: false,
          error: 'Tenant não encontrado',
        };
      }

      const evolutionId = mapping.evolutionInstanceId;

      // Desconecta na Evolution se estava conectado
      if (mapping.isConnected) {
        const evolutionService = getEvolutionService();
        await evolutionService.disconnect(evolutionId, tenantId);
      }

      // Deleta mapeamento
      await prisma.tenantEvolutionMapping.delete({
        where: { tenantId },
      });

      // Decrementa contador de tenants
      await prisma.evolutionInstance.update({
        where: { id: evolutionId },
        data: {
          tenantCount: {
            decrement: 1,
          },
        },
      });

      console.log(`🗑️ Tenant ${tenantId} removido da Evolution ${evolutionId}`);

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar conexão Evolution do tenant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Obtém status da conexão Evolution de um tenant
   */
  async getTenantEvolutionStatus(tenantId: string): Promise<{
    success: boolean;
    isConnected?: boolean;
    evolutionId?: number;
    whatsappPhone?: string;
    connectedAt?: Date;
    state?: string;
    error?: string;
  }> {
    try {
      let mapping = await prisma.tenantEvolutionMapping.findUnique({
        where: { tenantId },
      });

      if (!mapping) {
        return {
          success: false,
          error: 'Tenant não está alocado',
        };
      }

      // Consulta status direto na Evolution para garantir sincronização em tempo real
      const evolutionService = getEvolutionService();
      let liveStatus:
        | {
            isConnected: boolean;
            phoneNumber?: string;
            state?: string;
          }
        | null = null;

      try {
        liveStatus = await evolutionService.getStatus(
          mapping.evolutionInstanceId,
          tenantId
        );
      } catch (liveError) {
        console.error(
          `Erro ao consultar status na Evolution ${mapping.evolutionInstanceId}:`,
          liveError
        );
      }

      const isConnected =
        liveStatus?.isConnected !== undefined
          ? liveStatus.isConnected
          : mapping.isConnected;
      
      const state = liveStatus?.state || (isConnected ? 'open' : 'close');
      let connectedAt = mapping.connectedAt || undefined;

      if (isConnected && !connectedAt) {
        connectedAt = new Date();
      }

      // Mantém banco sincronizado com o estado real
      if (liveStatus) {
        // Só atualiza o que realmente mudou
        // Se Evolution não retorna número, mantém o do banco
        const shouldUpdatePhone = liveStatus.phoneNumber !== undefined && liveStatus.phoneNumber !== null;
        
        if (
          liveStatus.isConnected !== mapping.isConnected ||
          (shouldUpdatePhone && liveStatus.phoneNumber !== mapping.whatsappPhoneNumber)
        ) {
          console.log(
            `[getTenantEvolutionStatus] Atualizando banco: isConnected=${liveStatus.isConnected}, phoneNumber="${
              shouldUpdatePhone ? liveStatus.phoneNumber : mapping.whatsappPhoneNumber
            }"`
          );
          
          const updateData: any = {
            isConnected: liveStatus.isConnected,
            connectedAt: liveStatus.isConnected ? connectedAt : mapping.connectedAt,
            disconnectedAt: liveStatus.isConnected ? null : new Date(),
          };
          
          // Só atualiza phoneNumber se Evolution retornou um valor
          if (shouldUpdatePhone) {
            updateData.whatsappPhoneNumber = liveStatus.phoneNumber;
          }
          
          // Recarrega mapping após atualizar
          mapping = await prisma.tenantEvolutionMapping.update({
            where: { tenantId },
            data: updateData,
          });
        }
      }

      // Usa sempre o valor mais atualizado do mapping
      const whatsappPhone = mapping.whatsappPhoneNumber || undefined;

      console.log(
        `[getTenantEvolutionStatus] Retornando para tenant ${tenantId}: isConnected=${isConnected}, phoneNumber="${whatsappPhone}", state="${state}"`
      );

      return {
        success: true,
        isConnected,
        evolutionId: mapping.evolutionInstanceId,
        whatsappPhone,
        connectedAt,
        state,
      };
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Obtém status de todas as Evolution instances
   */
  async getAllEvolutionStatus(): Promise<{
    success: boolean;
    instances?: Array<{
      id: number;
      name: string;
      url: string;
      tenantCount: number;
      isActive: boolean;
      occupancyPercent: number;
    }>;
    error?: string;
  }> {
    try {
      const instances = await prisma.evolutionInstance.findMany();

      const status = instances.map((instance) => ({
        id: instance.id,
        name: instance.name,
        url: instance.url,
        tenantCount: instance.tenantCount,
        isActive: instance.isActive,
        occupancyPercent: Math.round(
          (instance.tenantCount / MAX_TENANTS_PER_EVOLUTION) * 100
        ),
      }));

      return {
        success: true,
        instances: status,
      };
    } catch (error) {
      console.error('Erro ao obter status das Evolution instances:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}

// Singleton instance
let allocationService: EvolutionAllocationService;

export function getEvolutionAllocationService(): EvolutionAllocationService {
  if (!allocationService) {
    allocationService = new EvolutionAllocationService();
  }
  return allocationService;
}
