import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticateToken, validateTenant } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, validateTenant);

// Listar agendamentos
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '20', startDate, endDate, status } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    const where: any = { tenantId: req.tenantId };
    
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }
    
    if (status) {
      where.status = status;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { startTime: 'asc' },
        include: {
          client: true,
          professional: true,
          service: true,
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (error) {
    console.error('List appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar agendamento
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      clientId,
      professionalId,
      serviceId,
      notes,
    } = req.body;

    if (!title || !startTime || !endTime || !clientId || !professionalId || !serviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verificar conflitos de agendamento
    const conflict = await prisma.appointment.findFirst({
      where: {
        tenantId: req.tenantId,
        professionalId,
        status: { notIn: ['CANCELED'] },
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
          },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({ error: 'Professional has conflicting appointment' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clientId,
        professionalId,
        serviceId,
        notes,
        tenantId: req.tenantId!,
      },
      include: {
        client: true,
        professional: true,
        service: true,
      },
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Atualizar status do agendamento
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const appointment = await prisma.appointment.updateMany({
      where: { id: req.params.id, tenantId: req.tenantId },
      data: { status },
    });

    if (appointment.count === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updated = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { client: true, professional: true, service: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancelar agendamento
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    const appointment = await prisma.appointment.updateMany({
      where: { id: req.params.id, tenantId: req.tenantId },
      data: {
        status: 'CANCELED',
        cancelReason: reason,
        canceledAt: new Date(),
      },
    });

    if (appointment.count === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
