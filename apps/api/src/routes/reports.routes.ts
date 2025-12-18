import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Helper to parse dates
function parseDateOrDefault(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const d = new Date(value);
  return isNaN(d.getTime()) ? fallback : d;
}

// GET /api/reports/sales?start=YYYY-MM-DD&end=YYYY-MM-DD&tenantId=...
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const { start, end, tenantId } = req.query as Record<string, string | undefined>;
    const startDate = parseDateOrDefault(start, new Date(Date.now() - 1000 * 60 * 60 * 24 * 30));
    const endDate = parseDateOrDefault(end, new Date());

    const where: any = {
      type: 'INCOME',
      createdAt: { gte: startDate, lte: endDate },
    };
    if (tenantId) where.tenantId = tenantId;

    const transactions = await prisma.transaction.findMany({
      where,
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Bucket by day
    const buckets: Record<string, number> = {};
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10);
      buckets[key] = 0;
      cursor.setDate(cursor.getDate() + 1);
    }

    transactions.forEach((t) => {
      const key = t.createdAt.toISOString().slice(0, 10);
      if (!buckets[key]) buckets[key] = 0;
      buckets[key] += Number(t.amount || 0);
    });

    const result = Object.keys(buckets)
      .sort()
      .map((date) => ({ date, total: buckets[date] }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Sales report error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/finance?start=...&end=...&tenantId=...
router.get('/finance', async (req: Request, res: Response) => {
  try {
    const { start, end, tenantId } = req.query as Record<string, string | undefined>;
    const startDate = parseDateOrDefault(start, new Date(Date.now() - 1000 * 60 * 60 * 24 * 30));
    const endDate = parseDateOrDefault(end, new Date());

    const where: any = { createdAt: { gte: startDate, lte: endDate } };
    if (tenantId) where.tenantId = tenantId;

    const transactions = await prisma.transaction.findMany({ where, select: { amount: true, type: true } });

    const totals: Record<string, number> = {};
    transactions.forEach((t) => {
      const k = String(t.type || 'UNKNOWN');
      totals[k] = (totals[k] || 0) + Number(t.amount || 0);
    });

    const result = Object.keys(totals).map((k) => ({ type: k, total: totals[k] }));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Finance report error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/appointments?start=...&end=...&tenantId=...
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const { start, end, tenantId } = req.query as Record<string, string | undefined>;
    const startDate = parseDateOrDefault(start, new Date(Date.now() - 1000 * 60 * 60 * 24 * 30));
    const endDate = parseDateOrDefault(end, new Date());

    const where: any = { startTime: { gte: startDate, lte: endDate } };
    if (tenantId) where.tenantId = tenantId;

    const appts = await prisma.appointment.findMany({ where, select: { status: true } });

    const counts: Record<string, number> = {};
    appts.forEach((a) => {
      const k = String(a.status || 'UNKNOWN');
      counts[k] = (counts[k] || 0) + 1;
    });

    const result = Object.keys(counts).map((k) => ({ status: k, count: counts[k] }));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Appointments report error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
