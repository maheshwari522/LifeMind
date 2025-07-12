import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if Deepgram API key is configured
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return NextResponse.json({ 
        error: 'Deepgram API key not configured. Please set DEEPGRAM_API_KEY in your environment variables.' 
      }, { status: 500 });
    }

    // Convert audio to buffer
    const audioBuffer = await audioFile.arrayBuffer();

    // Call Deepgram API
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': audioFile.type,
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deepgram API error:', errorData);
      return NextResponse.json({ 
        error: `Deepgram API error: ${response.status} - ${errorData}` 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Extract transcript from Deepgram response
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0.9;
    
    return NextResponse.json({ 
      text: transcript,
      confidence: confidence,
      provider: 'deepgram'
    });

  } catch (error) {
    console.error('Deepgram STT error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio' 
    }, { status: 500 });
  }
} 