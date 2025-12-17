import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticateToken, validateTenant } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken, validateTenant);

// Listar clientes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '10', search } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    const where: any = { tenantId: req.tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      success: true,
      data: clients,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (error) {
    console.error('List clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar cliente
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, cpf, address, city, birthDate, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        cpf,
        address,
        city,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        notes,
        tenantId: req.tenantId!,
      },
    });

    res.status(201).json({ success: true, data: client });
  } catch (error: any) {
    console.error('Create client error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
      return res.status(400).json({ error: 'CPF already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obter cliente por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Atualizar cliente
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, cpf, address, city, birthDate, notes, active } = req.body;

    const client = await prisma.client.updateMany({
      where: { id: req.params.id, tenantId: req.tenantId },
      data: {
        name,
        email,
        phone,
        cpf,
        address,
        city,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        notes,
        active,
      },
    });

    if (client.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updated = await prisma.client.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deletar cliente
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.client.deleteMany({
      where: { id: req.params.id, tenantId: req.tenantId },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
