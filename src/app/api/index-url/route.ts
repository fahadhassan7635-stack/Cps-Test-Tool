import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  // 1. Get the URL to index from the query string
  const { searchParams } = new URL(request.url);
  const urlToIndex = searchParams.get('url');

  if (!urlToIndex) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }

  // 2. Setup Google Auth using Environment Variables
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // Replace literal '\n' characters in the env variable with actual newlines
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Google API credentials not found in environment variables' },
        { status: 500 }
      );
    }

    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    // 3. Authenticate with Google
    await jwtClient.authorize();

    // 4. Send Indexing Request
    const indexing = google.indexing({ version: 'v3', auth: jwtClient });
    
    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: urlToIndex,
        type: 'URL_UPDATED', // 'URL_UPDATED' for new or updated pages, 'URL_DELETED' for removed pages
      },
    });

    // 5. Return Success
    return NextResponse.json({
      success: true,
      message: `Successfully requested indexing for: ${urlToIndex}`,
      googleResponse: res.data,
    });

  } catch (error: any) {
    console.error('Error indexing URL:', error);
    return NextResponse.json(
      { error: 'Failed to request indexing', details: error.message },
      { status: 500 }
    );
  }
}
