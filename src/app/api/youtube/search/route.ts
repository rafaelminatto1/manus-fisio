import { NextRequest, NextResponse } from 'next/server';
import YouTubeService, { YouTubeVideo } from '@/services/youtube-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const maxResults = parseInt(searchParams.get('maxResults') || '8');
    const order = searchParams.get('order') as any || 'relevance';
    const condition = searchParams.get('condition');

    if (!query && !condition) {
      return NextResponse.json(
        { error: 'Query ou condition é obrigatório' },
        { status: 400 }
      );
    }

    let videos = [];
    
    if (condition) {
      // Busca específica para condição fisioterapêutica
      videos = await YouTubeService.searchPhysiotherapyVideos(condition);
    } else if (query) {
      // Busca geral
      videos = await YouTubeService.searchVideos({
        query,
        maxResults,
        order
      });
    }

    return NextResponse.json({
      success: true,
      videos: videos || [],
      count: videos?.length || 0
    });

  } catch (error) {
    console.error('Erro na API YouTube:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, maxResults = 8, order = 'relevance', condition } = body;

    if (!query && !condition) {
      return NextResponse.json(
        { error: 'Query ou condition é obrigatório' },
        { status: 400 }
      );
    }

    let videos;
    
    if (condition) {
      videos = await YouTubeService.searchPhysiotherapyVideos(condition);
    } else {
      videos = await YouTubeService.searchVideos({
        query,
        maxResults,
        order
      });
    }

    return NextResponse.json({
      success: true,
      videos: videos || [],
      count: videos?.length || 0
    });

  } catch (error) {
    console.error('Erro na API YouTube:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 