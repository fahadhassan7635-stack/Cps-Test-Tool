import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import crypto from 'node:crypto';

// Supported Google Indexing notification types
const ALLOWED_NOTIFICATION_TYPES = ['URL_UPDATED', 'URL_DELETED'] as const;
type NotificationType = (typeof ALLOWED_NOTIFICATION_TYPES)[number];

// Constant-time string comparison to prevent timing attacks on admin secret
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison against itself to equalize timing profile
    crypto.timingSafeEqual(bufB, bufB);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Strictly validate URL for FixedAim production domain
function validateFixedAimUrl(rawUrl: unknown): { valid: true; url: string } | { valid: false; reason: string } {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { valid: false, reason: 'URL must be a non-empty string' };
  }

  const trimmed = rawUrl.trim();

  // Reject protocol-relative URLs or backslashes
  if (trimmed.startsWith('//') || trimmed.includes('\\')) {
    return { valid: false, reason: 'Protocol-relative or malformed URLs are not permitted' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Malformed URL' };
  }

  // Enforce HTTPS
  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTPS URLs are permitted' };
  }

  // Reject credentials in URL (e.g., https://user:pass@fixedaim.com)
  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'URLs containing embedded credentials are not permitted' };
  }

  // Strict hostname whitelist
  const allowedHostnames = new Set(['fixedaim.com', 'www.fixedaim.com']);
  if (!allowedHostnames.has(parsed.hostname.toLowerCase())) {
    return { valid: false, reason: 'URL hostname must strictly be fixedaim.com or www.fixedaim.com' };
  }

  // Reject non-standard ports
  if (parsed.port !== '' && parsed.port !== '443') {
    return { valid: false, reason: 'Non-standard port numbers are not permitted' };
  }

  return { valid: true, url: parsed.toString() };
}

// Reject GET with 405 Method Not Allowed (Indexing is state-changing)
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use authenticated POST to submit indexing requests.' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    }
  );
}

export async function POST(request: Request) {
  // 1. Authenticate using dedicated server-side environment secret
  const adminSecret = process.env.INDEXING_ADMIN_SECRET;
  if (!adminSecret || adminSecret.trim().length < 16) {
    console.error('[Indexing API] INDEXING_ADMIN_SECRET is missing or insufficiently strong in environment.');
    return NextResponse.json(
      { error: 'Indexing service authentication is not configured on this server.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid Authorization header' },
      { status: 401 }
    );
  }

  const providedToken = authHeader.slice(7).trim();
  if (!safeCompare(providedToken, adminSecret)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid credentials' },
      { status: 401 }
    );
  }

  // 2. Parse and validate JSON request body
  let body: Record<string, unknown>;
  try {
    const rawText = await request.text();
    if (rawText.length > 4096) {
      return NextResponse.json({ error: 'Payload Too Large' }, { status: 413 });
    }
    body = JSON.parse(rawText);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Malformed or invalid JSON payload' }, { status: 400 });
  }

  // 3. Validate URL
  const urlValidation = validateFixedAimUrl(body.url);
  if (!urlValidation.valid) {
    return NextResponse.json({ error: urlValidation.reason }, { status: 400 });
  }

  // 4. Validate notification type (default to URL_UPDATED)
  let notificationType: NotificationType = 'URL_UPDATED';
  if (body.type !== undefined) {
    if (
      typeof body.type !== 'string' ||
      !ALLOWED_NOTIFICATION_TYPES.includes(body.type as NotificationType)
    ) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Permitted values: URL_UPDATED, URL_DELETED' },
        { status: 400 }
      );
    }
    notificationType = body.type as NotificationType;
  }

  // 5. Setup Google Auth using Environment Variables
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.error('[Indexing API] Google API credentials not found in environment variables.');
    return NextResponse.json(
      { error: 'Google API credentials not configured in environment variables' },
      { status: 503 }
    );
  }

  try {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    await jwtClient.authorize();

    const indexing = google.indexing({ version: 'v3', auth: jwtClient });

    await indexing.urlNotifications.publish({
      requestBody: {
        url: urlValidation.url,
        type: notificationType,
      },
    });

    // Return generic success response without exposing internal Google service account details
    return NextResponse.json({
      success: true,
      message: `Successfully requested indexing for: ${urlValidation.url}`,
      type: notificationType,
    });
  } catch (error: unknown) {
    // Log diagnostic error on server without leaking details or secrets to client
    const errorMsg = error instanceof Error ? error.message : 'Unknown indexing error';
    console.error('[Indexing API Error]', errorMsg);

    return NextResponse.json(
      { error: 'Failed to request indexing with Google API.' },
      { status: 500 }
    );
  }
}
