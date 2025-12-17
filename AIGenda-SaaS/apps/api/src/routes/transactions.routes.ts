import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticateToken, validateTenant } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, validateTenant);

// Listar transações
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '20', type, status, startDate, endDate } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    const where: any = { tenantId: req.tenantId };
    if (type) where.type = type;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          professional: true,
          appointment: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar transação
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      description,
      amount,
      paymentMethod,
      clientId,
      professionalId,
      appointmentId,
      notes,
    } = req.body;

    if (!type || !description || !amount) {
      return res.status(400).json({ error: 'Type, description, and amount are required' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        description,
        amount,
        paymentMethod,
        clientId,
        professionalId,
        appointmentId,
        notes,
        tenantId: req.tenantId!,
      },
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard financeiro
router.get('/dashboard/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where: any = { tenantId: req.tenantId };
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [totalIncome, totalExpenses, totalCommissions, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'COMMISSION' },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where }),
    ]);

    const balance =
      (totalIncome._sum.amount || 0) -
      (totalExpenses._sum.amount || 0) -
      (totalCommissions._sum.amount || 0);

    res.json({
      success: true,
      data: {
        income: totalIncome._sum.amount || 0,
        expenses: totalExpenses._sum.amount || 0,
        commissions: totalCommissions._sum.amount || 0,
        balance,
        transactionCount,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
