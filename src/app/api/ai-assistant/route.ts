import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `You are FixedAim's AI-Powered Contextual Assistant, an expert gaming coach specialized in:
- CPS (Clicks Per Second) testing and performance benchmarks
- Advanced clicking techniques: Normal clicking, Jitter clicking, Butterfly clicking, and Drag clicking
- Gaming mouse hardware: debounce time, polling rate (1000Hz - 8000Hz), optical vs mechanical switches, DPI and sensors
- Minecraft PvP combat mechanics: hit registration, knockback reduction, sprint resetting, combo-locking, bridging
- FPS aim training: semi-auto fire caps in CS2, Valorant, PUBG, and Apex Legends
- Ergonomics and injury prevention: avoiding RSI and carpal tunnel syndrome, warm-ups, finger stretches

Keep answers concise (2-4 paragraphs maximum), actionable, and friendly. Use bullet points where appropriate.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = (body.prompt || '').trim();
    const context = (body.context || '').trim();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key configured, inform the client to use local smart engine
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: 'No GEMINI_API_KEY configured in environment.',
      });
    }

    const fullPrompt = context
      ? `User context / active topic: ${context}\n\nUser Question: ${prompt}`
      : prompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
      const errText = await response.text();
      console.warn('Gemini API call failed, falling back to local engine:', errText);
      return NextResponse.json({
        success: false,
        fallback: true,
        details: errText,
      });
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: 'Empty response from model',
      });
    }

    return NextResponse.json({
      success: true,
      fallback: false,
      response: generatedText,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, fallback: true, error: msg },
      { status: 200 }
    );
  }
}
