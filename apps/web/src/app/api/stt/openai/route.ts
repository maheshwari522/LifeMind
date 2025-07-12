import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' 
      }, { status: 500 });
    }

    // Create a new FormData for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile, 'audio.webm');
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('response_format', 'json');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        // Don't set Content-Type - let the browser set it with boundary
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ 
        error: `OpenAI API error: ${response.status} - ${errorData}` 
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ 
      text: result.text,
      confidence: 0.95,
      provider: 'openai'
    });

  } catch (error) {
    console.error('OpenAI STT error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio' 
    }, { status: 500 });
  }
} 