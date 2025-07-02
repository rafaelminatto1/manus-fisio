'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import YouTubeVideoPlayer, { CompactYouTubePlayer } from '@/components/ui/youtube-video-player';
import YouTubeService, { YouTubeVideo } from '@/services/youtube-service';
import { Search, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoLibraryProps {
  patientCondition?: string;
  onVideoSelect?: (video: YouTubeVideo) => void;
  className?: string;
}

export default function VideoLibraryComponent({
  patientCondition,
  onVideoSelect,
  className = ''
}: VideoLibraryProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Categorias de exercícios
  const categories = {
    'todos': 'Todos os Vídeos',
    'lombalgia': 'Lombalgia',
    'cervicalgia': 'Cervicalgia',
    'ombro': 'Ombro',
    'joelho': 'Joelho',
    'quadril': 'Quadril'
  };

  // Carregar vídeos iniciais
  useEffect(() => {
    if (patientCondition) {
      loadVideosForCondition(patientCondition);
    } else {
      loadVideos('exercícios fisioterapia');
    }
  }, [patientCondition]);

  const loadVideosForCondition = async (condition: string) => {
    setLoading(true);
    try {
      const videos = await YouTubeService.searchPhysiotherapyVideos(condition);
      setVideos(videos);
      if (videos.length > 0 && videos[0]) {
        setSelectedVideo(videos[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (query: string) => {
    setLoading(true);
    try {
      const videos = await YouTubeService.searchVideos({
        query: `${query} fisioterapia`,
        maxResults: 12,
        order: 'relevance'
      });
      setVideos(videos);
      if (videos.length > 0 && videos[0]) {
        setSelectedVideo(videos[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadVideos(searchQuery);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'todos') {
      loadVideos('exercícios fisioterapia');
    } else {
      loadVideos(category);
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId];
      
      toast.success(
        prev.includes(videoId) 
          ? 'Vídeo removido dos favoritos' 
          : 'Vídeo adicionado aos favoritos'
      );
      
      return newFavorites;
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com busca */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Buscar exercícios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categories).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {patientCondition && (
          <Badge variant="secondary">
            Vídeos para: {patientCondition}
          </Badge>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player principal */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="space-y-4">
              <YouTubeVideoPlayer
                videoId={selectedVideo.id}
                title={selectedVideo.title}
                description={selectedVideo.description}
                channelTitle={selectedVideo.channelTitle}
                duration={selectedVideo.duration}
                showControls={true}
                showInfo={true}
              />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFavorite(selectedVideo.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.includes(selectedVideo.id) 
                        ? 'fill-current text-red-500' 
                        : ''
                    }`} 
                  />
                  {favorites.includes(selectedVideo.id) ? 'Favoritado' : 'Favoritar'}
                </Button>
                
                {onVideoSelect && (
                  <Button onClick={() => onVideoSelect(selectedVideo)}>
                    Usar este Vídeo
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <CardContent>
                <p className="text-muted-foreground">
                  Selecione um vídeo para começar
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de vídeos */}
        <div className="space-y-4">
          <h3 className="font-semibold">
            Vídeos Disponíveis ({videos.length})
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-12 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              videos.map((video) => (
                <Card
                  key={video.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVideo?.id === video.id
                      ? 'bg-primary/10 border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        {video.duration && (
                          <Badge 
                            variant="secondary" 
                            className="absolute bottom-0 right-0 text-xs bg-black/70 text-white"
                          >
                            {video.duration}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {video.channelTitle}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(video.id);
                        }}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.includes(video.id) 
                              ? 'fill-current text-red-500' 
                              : ''
                          }`} 
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 