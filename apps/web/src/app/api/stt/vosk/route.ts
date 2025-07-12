import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Vosk server expects WebSocket connection, but we'll use HTTP for simplicity
    // First, let's check if the server is ready
    const serverStatus = await fetch('http://localhost:2700/status', {
      method: 'GET',
    }).catch(() => null);

    if (!serverStatus || !serverStatus.ok) {
      return NextResponse.json(
        { error: 'Vosk server not available. Please ensure Docker is running and Vosk server is started.' },
        { status: 503 }
      );
    }

    // For now, return a placeholder response since Vosk WebSocket integration is complex
    // In a real implementation, you'd need to establish a WebSocket connection
    return NextResponse.json({
      text: "Vosk server is running but WebSocket integration needs to be implemented. Please use Web Speech API for now.",
      confidence: 0.9,
      provider: 'vosk'
    });

  } catch (error) {
    console.error('Vosk STT error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio with Vosk' },
      { status: 500 }
    );
  }
} 