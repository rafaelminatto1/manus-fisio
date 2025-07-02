'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import YouTubeVideoPlayer, { CompactYouTubePlayer } from '@/components/ui/youtube-video-player';
import YouTubeService, { YouTubeVideo } from '@/services/youtube-service';
import { Search, Filter, Play, Clock, User, Heart, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface VideoLibraryProps {
  patientCondition?: string;
  onVideoSelect?: (video: YouTubeVideo) => void;
  className?: string;
}

export default function VideoLibrary({
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

  // Categorias de exercícios fisioterapêuticos
  const categories = {
    'todos': 'Todos os Vídeos',
    'lombalgia': 'Lombalgia',
    'cervicalgia': 'Cervicalgia',
    'ombro': 'Ombro',
    'joelho': 'Joelho',
    'quadril': 'Quadril',
    'alongamento': 'Alongamentos',
    'fortalecimento': 'Fortalecimento',
    'mobilidade': 'Mobilidade',
    'postura': 'Postura'
  };

  // Carregar vídeos iniciais
  useEffect(() => {
    if (patientCondition) {
      loadVideosForCondition(patientCondition);
    } else {
      loadVideos('exercícios fisioterapia');
    }
  }, [patientCondition]);

  // Carregar vídeos para uma condição específica
  const loadVideosForCondition = async (condition: string) => {
    setLoading(true);
    try {
      const videos = await YouTubeService.searchPhysiotherapyVideos(condition);
      setVideos(videos);
      if (videos.length > 0) {
        setSelectedVideo(videos[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar vídeos por busca
  const loadVideos = async (query: string) => {
    setLoading(true);
    try {
      const videos = await YouTubeService.searchVideos({
        query: `${query} fisioterapia`,
        maxResults: 12,
        order: 'relevance'
      });
      setVideos(videos);
      if (videos.length > 0 && !selectedVideo) {
        setSelectedVideo(videos[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar vídeos
  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadVideos(searchQuery);
    }
  };

  // Filtrar por categoria
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'todos') {
      loadVideos('exercícios fisioterapia');
    } else {
      loadVideos(category);
    }
  };

  // Selecionar vídeo
  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  // Adicionar/remover dos favoritos
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

  // Compartilhar vídeo
  const shareVideo = async (video: YouTubeVideo) => {
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Confira este exercício: ${video.title}`,
          url: url,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar para clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência');
      } catch (error) {
        toast.error('Erro ao copiar link');
      }
    }
  };

  // Filtrar vídeos exibidos
  const filteredVideos = videos.filter(video => {
    if (selectedCategory === 'todos') return true;
    return video.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
           video.description?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com busca e filtros */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Buscar exercícios, condições ou técnicas..."
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Vídeos para: {patientCondition}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadVideos('exercícios fisioterapia')}
            >
              Ver todos os vídeos
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <Tabs defaultValue="player" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="player">Player Principal</TabsTrigger>
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
        </TabsList>

        {/* Player principal com lista */}
        <TabsContent value="player" className="space-y-4">
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
                  
                  {/* Ações do vídeo */}
                  <div className="flex items-center justify-between">
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
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareVideo(selectedVideo)}
                      >
                        <Share2 className="h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                    
                    {onVideoSelect && (
                      <Button onClick={() => onVideoSelect(selectedVideo)}>
                        <Download className="h-4 w-4 mr-2" />
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
                Vídeos Disponíveis ({filteredVideos.length})
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
                  filteredVideos.map((video) => (
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
                            {video.viewCount && (
                              <p className="text-xs text-muted-foreground">
                                {video.viewCount} visualizações
                              </p>
                            )}
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
        </TabsContent>

        {/* Visualização em grade */}
        <TabsContent value="grid" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div key={video.id} className="relative group">
                  <CompactYouTubePlayer
                    videoId={video.id}
                    title={video.title}
                    channelTitle={video.channelTitle}
                    duration={video.duration}
                    className="cursor-pointer"
                  />
                  
                  {/* Overlay com ações */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleFavorite(video.id)}
                        className="bg-black/50 hover:bg-black/70"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.includes(video.id) 
                              ? 'fill-current text-red-500' 
                              : 'text-white'
                          }`} 
                        />
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => shareVideo(video)}
                        className="bg-black/50 hover:bg-black/70 text-white"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {onVideoSelect && (
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => onVideoSelect(video)}
                        className="w-full"
                      >
                        Usar este Vídeo
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 