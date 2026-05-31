// src/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';


interface BinParams {
  slug: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'xw_';
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ─── Create a new webhook bin ────────────────────────────────────────────────

export const createBin = async (req: Request, res: Response) => {
  try {
    const slug = generateSlug();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const bin = await prisma.webhookBin.create({
      data: { slug, expiresAt },
    });

    return res.status(201).json({ id: bin.id, slug: bin.slug, expiresAt: bin.expiresAt });
  } catch (error) {
    console.error('[createBin]', error);
    return res.status(500).json({ error: 'Failed to create webhook bin' });
  }
};

// ─── Receive an incoming webhook (all methods) ───────────────────────────────

export const receiveBin = async (req: Request<BinParams>, res: Response) => {
  const { slug } = req.params;

  try {
    const bin = await prisma.webhookBin.findUnique({ where: { slug } });

    if (!bin) {
      return res.status(404).json({ error: 'Webhook bin not found' });
    }

    if (bin.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Webhook bin has expired' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    let parsedBody: any = null;
    try {
      parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      parsedBody = null;
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;

    await prisma.webhookRequest.create({
      data: {
        binId: bin.id,
        method: req.method,
        headers: req.headers as any,
        query: req.query as any,
        body: parsedBody,
        rawBody,
        ip,
      },
    });

    // Acknowledge immediately
    return res.status(200).json({ ok: true, message: 'Webhook received' });
  } catch (error) {
    console.error('[receiveBin]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── Poll: get requests for a bin ───────────────────────────────────────────

export const getBinRequests = async (req: Request<BinParams>, res: Response) => {
  const { slug } = req.params;
  const since = req.query.since ? new Date(req.query.since as string) : undefined;

  try {
    const bin = await prisma.webhookBin.findUnique({ where: { slug } });

    if (!bin) return res.status(404).json({ error: 'Bin not found' });

    const requests = await prisma.webhookRequest.findMany({
      where: {
        binId: bin.id,
        ...(since ? { receivedAt: { gt: since } } : {}),
      },
      orderBy: { receivedAt: 'desc' },
      take: 50,
    });

    return res.json({
      slug: bin.slug,
      expiresAt: bin.expiresAt,
      requests,
    });
  } catch (error) {
    console.error('[getBinRequests]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── Clear all requests for a bin ───────────────────────────────────────────

export const clearBin = async (req: Request<BinParams>, res: Response) => {
  const { slug } = req.params;

  try {
    const bin = await prisma.webhookBin.findUnique({ where: { slug } });
    if (!bin) return res.status(404).json({ error: 'Bin not found' });

    await prisma.webhookRequest.deleteMany({ where: { binId: bin.id } });

    return res.json({ ok: true });
  } catch (error) {
    console.error('[clearBin]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};