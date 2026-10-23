import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `You are FixedAim's AI-Powered Contextual Assistant, an expert gaming coach specialized in:
- CPS (Clicks Per Second) testing and performance benchmarks
- Advanced clicking techniques: Normal clicking, Jitter clicking, Butterfly clicking, and Drag clicking
- Gaming mouse hardware: debounce time, polling rate (1000Hz - 8000Hz), optical vs mechanical switches, DPI and sensors
- Minecraft PvP combat mechanics: hit registration, knockback reduction, sprint resetting, combo-locking, bridging
- FPS aim training: semi-auto fire caps in CS2, Valorant, PUBG, and Apex Legends
- Ergonomics and injury prevention: avoiding RSI and carpal tunnel syndrome, warm-ups, finger stretches

Keep answers concise (2-4 paragraphs maximum), actionable, and friendly. Use bullet points where appropriate.`;

// Safety and Abuse Limits
const MAX_PROMPT_LENGTH = 300;
const MAX_CONTEXT_LENGTH = 200;
const MAX_PAYLOAD_BYTES = 4096;

// Rate Limiting Configuration: 5 requests per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory process cache (effective for warm serverless instances and local dev)
const inMemoryStore = new Map<string, RateLimitRecord>();

function cleanupInMemoryStore(): void {
  const now = Date.now();
  for (const [ip, record] of inMemoryStore.entries()) {
    if (now >= record.resetAt) {
      inMemoryStore.delete(ip);
    }
  }
}

function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function getClientIp(request: Request): string {
  // 1. Vercel Edge Proxy header (cannot be forged by clients connecting to Vercel)
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  // 2. Cloudflare connecting IP
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  // 3. Fallback: Parse first IP from x-forwarded-for if valid
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (isValidIp(firstIp)) {
      return firstIp;
    }
  }

  return '127.0.0.1';
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  isSharedStore: boolean;
}

async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. If an external distributed Redis store (Upstash/Vercel KV) is configured, use it
  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:ai-assistant:${ip}`;
      const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['TTL', key],
        ]),
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const currentCount = Number(results[0]?.result) || 1;
        let ttl = Number(results[1]?.result) || -1;

        if (ttl === -1) {
          // Set TTL of 60 seconds on first actuation
          await fetch(`${upstashUrl}/expire/${key}/60`, {
            headers: { Authorization: `Bearer ${upstashToken}` },
          });
          ttl = 60;
        }

        const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentCount);
        const allowed = currentCount <= RATE_LIMIT_MAX_REQUESTS;

        return {
          allowed,
          limit: RATE_LIMIT_MAX_REQUESTS,
          remaining,
          resetSeconds: ttl > 0 ? ttl : 60,
          isSharedStore: true,
        };
      }
    } catch (err) {
      console.error('[RateLimit] Distributed store check failed, falling back to local memory store:', err);
    }
  }

  // 2. In-memory sliding window fallback (process-level)
  cleanupInMemoryStore();
  const now = Date.now();
  const record = inMemoryStore.get(ip);

  if (!record || now >= record.resetAt) {
    inMemoryStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      isSharedStore: false,
    };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      resetSeconds,
      isSharedStore: false,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    allowed: true,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    resetSeconds,
    isSharedStore: false,
  };
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'Rate limit exceeded. Please wait a moment before sending another request.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetSeconds),
          },
        }
      );
    }

    // 2. Body Size Guard
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { success: false, fallback: true, error: 'Payload Too Large' },
        { status: 413 }
      );
    }

    const rawText = await request.text();
    if (rawText.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { success: false, fallback: true, error: 'Payload Too Large' },
        { status: 413 }
      );
    }

    // 3. JSON Parsing & Structure Validation
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json(
          { success: false, fallback: true, error: 'Request body must be a valid JSON object' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, fallback: true, error: 'Malformed or invalid JSON payload' },
        { status: 400 }
      );
    }

    // 4. Prompt Field Validation
    if (typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false, fallback: true, error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const prompt = body.prompt.trim();
    if (!prompt) {
      return NextResponse.json(
        { success: false, fallback: true, error: 'Prompt cannot be empty' },
        { status: 400 }
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: `Prompt exceeds maximum allowed length of ${MAX_PROMPT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // 5. Context Field Validation
    let context = '';
    if (body.context !== undefined && body.context !== null) {
      if (typeof body.context !== 'string') {
        return NextResponse.json(
          { success: false, fallback: true, error: 'Context must be a string if provided' },
          { status: 400 }
        );
      }
      context = body.context.trim();
      if (context.length > MAX_CONTEXT_LENGTH) {
        return NextResponse.json(
          {
            success: false,
            fallback: true,
            error: `Context exceeds maximum allowed length of ${MAX_CONTEXT_LENGTH} characters`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Verify Server-Side API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[AI Assistant] GEMINI_API_KEY is not configured in environment.');
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'AI Assistant service is currently unavailable.',
        },
        { status: 503 }
      );
    }

    const fullPrompt = context
      ? `User context / active topic: ${context}\n\nUser Question: ${prompt}`
      : prompt;

    // 7. Invoke Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    if (!response.ok) {
      // Diagnostic logging on server without leaking response body or key to client
      console.error('[AI Assistant] Gemini API upstream error status:', response.status);
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'AI Assistant service is temporarily unavailable.',
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'Empty response received from AI model.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        fallback: false,
        response: generatedText,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetSeconds),
        },
      }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Assistant Error]', errorMsg);
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        error: 'Internal server error while processing request.',
      },
      { status: 500 }
    );
  }
}
