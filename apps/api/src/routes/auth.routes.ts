import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { prisma } from '../index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

function parseJwtExpiresInSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value) return fallbackSeconds;

  const trimmed = value.trim();
  if (trimmed.length === 0) return fallbackSeconds;

  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const match = trimmed.match(/^(\d+(?:\.\d+)?)([smhd])$/i);
  if (!match) return fallbackSeconds;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase() as 's' | 'm' | 'h' | 'd';
  const multipliers: Record<typeof unit, number> = { s: 1, m: 60, h: 60 * 60, d: 60 * 60 * 24 };

  return Math.floor(amount * multipliers[unit]);
}

// Register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, tenantName, tenantSlug } = req.body;

    // Validar entrada
    if (!email || !password || !name || !tenantName || !tenantSlug) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Verificar se slug do tenant já existe
    const existingTenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (existingTenant) {
      return res.status(400).json({ error: 'Tenant slug already exists' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
        email,
      },
    });

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    // Criar configuração padrão
    await prisma.configuration.create({
      data: {
        tenantId: tenant.id,
      },
    });

    // Gerar tokens
    const jwtSecret: Secret = process.env.JWT_SECRET ?? 'secret';
    const tokenExpiresInSeconds = parseJwtExpiresInSeconds(process.env.JWT_EXPIRES_IN, 60 * 60 * 24 * 7);
    const refreshExpiresInSeconds = parseJwtExpiresInSeconds(
      process.env.REFRESH_TOKEN_EXPIRES_IN,
      60 * 60 * 24 * 30
    );
    const signOptions: SignOptions = {
      expiresIn: tokenExpiresInSeconds,
    };
    const refreshSignOptions: SignOptions = {
      expiresIn: refreshExpiresInSeconds,
    };

    const token = jwt.sign(
      { userId: user.id, tenantId: tenant.id, email: user.email },
      jwtSecret,
      signOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tenantId: tenant.id },
      jwtSecret,
      refreshSignOptions
    );

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    // Return error message to help debug in staging; keep generic in production
    const message = error?.message || 'Internal server error';
    res.status(500).json({ error: message });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    const jwtSecret: Secret = process.env.JWT_SECRET ?? 'secret';
    const tokenExpiresInSeconds = parseJwtExpiresInSeconds(process.env.JWT_EXPIRES_IN, 60 * 60 * 24 * 7);
    const refreshExpiresInSeconds = parseJwtExpiresInSeconds(
      process.env.REFRESH_TOKEN_EXPIRES_IN,
      60 * 60 * 24 * 30
    );

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, email: user.email },
      jwtSecret,
      { expiresIn: tokenExpiresInSeconds }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId },
      jwtSecret,
      { expiresIn: refreshExpiresInSeconds }
    );

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    const message = error?.message || 'Internal server error';
    res.status(500).json({ error: message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        tenantId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
