// Tipos para vídeos do YouTube
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  tags?: string[];
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
}

/**
 * Serviço para integração com YouTube
 */
export class YouTubeService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';

  /**
   * Busca vídeos no YouTube
   */
  static async searchVideos(params: YouTubeSearchParams): Promise<YouTubeVideo[]> {
    // Se não tiver API key, retorna vídeos mock
    if (!this.API_KEY) {
      console.warn('YouTube API Key não configurada - usando dados mock');
      return this.getMockVideos(params.query);
    }

    try {
      const searchParams = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        key: this.API_KEY || '',
        q: params.query,
        maxResults: (params.maxResults || 12).toString(),
        order: params.order || 'relevance',
      });

      const response = await fetch(`${this.BASE_URL}/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.id.videoId || '',
        title: item.snippet.title || '',
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
        channelTitle: item.snippet.channelTitle || '',
        publishedAt: item.snippet.publishedAt || '',
        tags: item.snippet.tags || []
      }));

    } catch (error) {
      console.error('Erro ao buscar vídeos no YouTube:', error);
      return this.getMockVideos(params.query);
    }
  }

  /**
   * Busca vídeos específicos para fisioterapia
   */
  static async searchPhysiotherapyVideos(condition: string): Promise<YouTubeVideo[]> {
    const queries = this.getPhysiotherapyQueries(condition);
    const videos = await this.searchVideos({
      query: queries[0], // Usa a primeira query mais específica
      maxResults: 8,
      order: 'relevance'
    });

    return videos;
  }

  /**
   * Extrai ID do vídeo de uma URL do YouTube
   */
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Gera URL de embed para um vídeo
   */
  static getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Valida se uma URL é do YouTube
   */
  static isYouTubeUrl(url: string): boolean {
    const youtubePatterns = [
      /^https?:\/\/(www\.)?youtube\.com/,
      /^https?:\/\/youtu\.be/,
      /^https?:\/\/(www\.)?m\.youtube\.com/
    ];

    return youtubePatterns.some(pattern => pattern.test(url));
  }

  // Métodos privados auxiliares

  /**
   * Obtém queries específicas para condições fisioterapêuticas
   */
  private static getPhysiotherapyQueries(condition: string): string[] {
    const baseQueries: Record<string, string[]> = {
      'lombalgia': [
        'exercícios lombalgia fisioterapia',
        'alongamento coluna lombar',
        'fortalecimento core lombar'
      ],
      'cervicalgia': [
        'exercícios cervical fisioterapia',
        'alongamento pescoço cervical',
        'fortalecimento cervical'
      ],
      'ombro': [
        'exercícios ombro fisioterapia',
        'reabilitação ombro',
        'alongamento ombro'
      ],
      'joelho': [
        'exercícios joelho fisioterapia',
        'reabilitação joelho',
        'fortalecimento quadríceps'
      ],
      'quadril': [
        'exercícios quadril fisioterapia',
        'alongamento quadril',
        'fortalecimento glúteo'
      ]
    };

    return baseQueries[condition.toLowerCase()] || [
      `exercícios ${condition} fisioterapia`,
      `reabilitação ${condition}`,
      `fisioterapia ${condition}`
    ];
  }

  /**
   * Retorna vídeos de exemplo quando a API não está disponível
   */
  private static getMockVideos(query: string): YouTubeVideo[] {
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: `Exercícios de Fisioterapia - ${query}`,
        description: 'Exercícios demonstrativos para reabilitação fisioterapêutica. Este vídeo apresenta uma série de exercícios seguros e eficazes.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channelTitle: 'Fisioterapia Profissional',
        publishedAt: new Date().toISOString(),
        duration: '5:30',
        viewCount: '1000000',
        tags: ['fisioterapia', 'exercícios', 'reabilitação']
      },
      {
        id: 'oHg5SJYRHA0',
        title: `Alongamentos Terapêuticos - ${query}`,
        description: 'Série de alongamentos terapêuticos para melhoria da mobilidade e alívio da dor.',
        thumbnail: 'https://img.youtube.com/vi/oHg5SJYRHA0/mqdefault.jpg',
        channelTitle: 'Reabilitação Física',
        publishedAt: new Date().toISOString(),
        duration: '8:15',
        viewCount: '500000',
        tags: ['alongamento', 'fisioterapia', 'mobilidade']
      },
      {
        id: 'L_jWHffIx5E',
        title: `Fortalecimento Muscular - ${query}`,
        description: 'Exercícios de fortalecimento muscular específicos para reabilitação.',
        thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg',
        channelTitle: 'Fisio & Movimento',
        publishedAt: new Date().toISOString(),
        duration: '12:45',
        viewCount: '750000',
        tags: ['fortalecimento', 'músculos', 'reabilitação']
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: `Mobilização Articular - ${query}`,
        description: 'Técnicas de mobilização articular para melhoria da amplitude de movimento.',
        thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
        channelTitle: 'Terapia Manual',
        publishedAt: new Date().toISOString(),
        duration: '6:20',
        viewCount: '300000',
        tags: ['mobilização', 'articular', 'amplitude']
      }
    ];

    return mockVideos.slice(0, Math.min(8, mockVideos.length));
  }
}

export default YouTubeService; 