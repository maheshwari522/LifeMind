import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if AssemblyAI API key is configured
    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyApiKey) {
      return NextResponse.json({ 
        error: 'AssemblyAI API key not configured. Please set ASSEMBLYAI_API_KEY in your environment variables.' 
      }, { status: 500 });
    }

    // Convert audio to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Call AssemblyAI API
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: `data:${audioFile.type};base64,${base64Audio}`,
        language_code: 'en',
        punctuate: true,
        format_text: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AssemblyAI API error:', errorData);
      return NextResponse.json({ 
        error: `AssemblyAI API error: ${response.status} - ${errorData}` 
      }, { status: response.status });
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      text: result.text || '',
      confidence: 0.9,
      provider: 'assemblyai'
    });

  } catch (error) {
    console.error('AssemblyAI STT error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio' 
    }, { status: 500 });
  }
} 