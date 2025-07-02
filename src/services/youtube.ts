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

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  videoDefinition?: 'high' | 'standard';
}

/**
 * Serviço para integração com YouTube API v3
 */
export class YouTubeService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';

  /**
   * Busca vídeos no YouTube
   */
  static async searchVideos(params: YouTubeSearchParams): Promise<YouTubeVideo[]> {
    if (!this.API_KEY) {
      console.warn('YouTube API Key não configurada');
      return this.getMockVideos(params.query);
    }

    try {
      const searchParams = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        key: this.API_KEY,
        q: params.query,
        maxResults: (params.maxResults || 12).toString(),
        order: params.order || 'relevance',
        ...(params.publishedAfter && { publishedAfter: params.publishedAfter }),
        ...(params.publishedBefore && { publishedBefore: params.publishedBefore }),
        ...(params.videoDuration && { videoDuration: params.videoDuration }),
        ...(params.videoDefinition && { videoDefinition: params.videoDefinition }),
      });

      const response = await fetch(`${this.BASE_URL}/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
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
    const allVideos: YouTubeVideo[] = [];

    for (const query of queries) {
      const videos = await this.searchVideos({
        query,
        maxResults: 6,
        order: 'relevance',
        videoDuration: 'medium' // Vídeos de 4-20 minutos
      });
      allVideos.push(...videos);
    }

    // Remove duplicatas e retorna os melhores
    const uniqueVideos = this.removeDuplicates(allVideos);
    return uniqueVideos.slice(0, 12);
  }

  /**
   * Obtém detalhes adicionais de um vídeo
   */
  static async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.API_KEY) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      
      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
        tags: item.snippet.tags || []
      };

    } catch (error) {
      console.error('Erro ao obter detalhes do vídeo:', error);
      return null;
    }
  }

  /**
   * Cria uma playlist personalizada para um paciente
   */
  static createPatientPlaylist(
    patientCondition: string, 
    videos: YouTubeVideo[]
  ): YouTubePlaylist {
    return {
      id: `playlist_${Date.now()}`,
      title: `Exercícios para ${patientCondition}`,
      description: `Playlist personalizada de exercícios fisioterapêuticos para tratamento de ${patientCondition}`,
      thumbnail: videos[0]?.thumbnail || '',
      videoCount: videos.length,
      videos: videos
    };
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
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Gera URL de embed para um vídeo
   */
  static getEmbedUrl(videoId: string, options?: {
    autoplay?: boolean;
    mute?: boolean;
    start?: number;
    end?: number;
  }): string {
    const params = new URLSearchParams();
    
    if (options?.autoplay) params.set('autoplay', '1');
    if (options?.mute) params.set('mute', '1');
    if (options?.start) params.set('start', options.start.toString());
    if (options?.end) params.set('end', options.end.toString());

    const queryString = params.toString();
    return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
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
        'fortalecimento core lombar',
        'exercícios dor nas costas'
      ],
      'cervicalgia': [
        'exercícios cervical fisioterapia',
        'alongamento pescoço cervical',
        'fortalecimento cervical',
        'exercícios dor no pescoço'
      ],
      'ombro': [
        'exercícios ombro fisioterapia',
        'reabilitação ombro',
        'alongamento ombro',
        'fortalecimento ombro'
      ],
      'joelho': [
        'exercícios joelho fisioterapia',
        'reabilitação joelho',
        'fortalecimento quadríceps',
        'exercícios joelho artrose'
      ],
      'quadril': [
        'exercícios quadril fisioterapia',
        'alongamento quadril',
        'fortalecimento glúteo',
        'mobilidade quadril'
      ]
    };

    return baseQueries[condition.toLowerCase()] || [
      `exercícios ${condition} fisioterapia`,
      `reabilitação ${condition}`,
      `fisioterapia ${condition}`
    ];
  }

  /**
   * Remove vídeos duplicados
   */
  private static removeDuplicates(videos: YouTubeVideo[]): YouTubeVideo[] {
    const seen = new Set<string>();
    return videos.filter(video => {
      if (seen.has(video.id)) {
        return false;
      }
      seen.add(video.id);
      return true;
    });
  }

  /**
   * Converte duração ISO 8601 para formato legível
   */
  private static parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    if (!match) return '0:00';

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Retorna vídeos de exemplo quando a API não está disponível
   */
  private static getMockVideos(query: string): YouTubeVideo[] {
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: `Exercícios de Fisioterapia - ${query}`,
        description: 'Exercícios demonstrativos para reabilitação fisioterapêutica',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channelTitle: 'Fisioterapia Profissional',
        publishedAt: new Date().toISOString(),
        duration: '5:30',
        viewCount: '1000000',
        tags: ['fisioterapia', 'exercícios', 'reabilitação']
      },
      {
        id: 'oHg5SJYRHA0',
        title: `Alongamentos para ${query}`,
        description: 'Série de alongamentos terapêuticos',
        thumbnail: 'https://img.youtube.com/vi/oHg5SJYRHA0/mqdefault.jpg',
        channelTitle: 'Reabilitação Física',
        publishedAt: new Date().toISOString(),
        duration: '8:15',
        viewCount: '500000',
        tags: ['alongamento', 'fisioterapia', 'mobilidade']
      }
    ];

    return mockVideos;
  }
}

export default YouTubeService; 