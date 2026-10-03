import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlToIndex = searchParams.get('url');

  if (!urlToIndex) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }

  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Google API credentials not found in environment variables' },
        { status: 500 }
      );
    }

    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    await jwtClient.authorize();

    const indexing = google.indexing({ version: 'v3', auth: jwtClient });

    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: urlToIndex,
        type: 'URL_UPDATED',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully requested indexing for: ${urlToIndex}`,
      googleResponse: res.data,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to request indexing', details: msg },
      { status: 500 }
    );
  }
}
