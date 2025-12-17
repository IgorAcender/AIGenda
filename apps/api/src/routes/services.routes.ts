import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticateToken, validateTenant } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, validateTenant);

// Listar serviços
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { tenantId: req.tenantId },
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.count({ where: { tenantId: req.tenantId } }),
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (error) {
    console.error('List services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar serviço
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, duration, category } = req.body;

    if (!name || price === undefined || !duration) {
      return res.status(400).json({ error: 'Name, price, and duration are required' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        duration,
        category,
        tenantId: req.tenantId!,
      },
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
