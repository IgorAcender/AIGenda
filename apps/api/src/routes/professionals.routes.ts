import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticateToken, validateTenant } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, validateTenant);

// Listar profissionais
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where: { tenantId: req.tenantId },
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      prisma.professional.count({ where: { tenantId: req.tenantId } }),
    ]);

    res.json({
      success: true,
      data: professionals,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (error) {
    console.error('List professionals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar profissional
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, specialties, bio, avatar, commissionRate } = req.body;

    if (!name || !specialties) {
      return res.status(400).json({ error: 'Name and specialties are required' });
    }

    const professional = await prisma.professional.create({
      data: {
        name,
        specialties,
        bio,
        avatar,
        commissionRate,
        tenantId: req.tenantId!,
      },
    });

    res.status(201).json({ success: true, data: professional });
  } catch (error) {
    console.error('Create professional error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
