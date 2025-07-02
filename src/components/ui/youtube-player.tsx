'use client';

import { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  channelTitle?: string;
  duration?: string;
  viewCount?: string;
  tags?: string[];
  autoplay?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  className?: string;
}

export default function YouTubePlayer({
  videoId,
  title,
  description,
  channelTitle,
  duration,
  viewCount,
  tags = [],
  autoplay = false,
  showControls = true,
  showInfo = true,
  className = ''
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  // Configurações do player YouTube
  const opts: YouTubeProps['opts'] = {
    height: '315',
    width: '100%',
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      controls: showControls ? 1 : 0,
      modestbranding: 1, // Remove logo do YouTube
      rel: 0, // Não mostra vídeos relacionados
      showinfo: showInfo ? 1 : 0,
      fs: 1, // Permite fullscreen
      cc_load_policy: 1, // Carrega legendas se disponível
      iv_load_policy: 3, // Remove anotações
      origin: typeof window !== 'undefined' ? window.location.origin : undefined
    },
  };

  // Eventos do player
  const onReady = (event: any) => {
    setPlayer(event.target);
  };

  const onPlay = () => {
    setIsPlaying(true);
  };

  const onPause = () => {
    setIsPlaying(false);
  };

  const onEnd = () => {
    setIsPlaying(false);
  };

  // Controles personalizados
  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const formatViewCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header com informações do vídeo */}
      {showInfo && title && (
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2 mb-1">{title}</CardTitle>
              {channelTitle && (
                <p className="text-sm text-muted-foreground">{channelTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {duration && (
                <Badge variant="secondary" className="text-xs">
                  {duration}
                </Badge>
              )}
              {viewCount && (
                <span className="text-xs">
                  {formatViewCount(viewCount)} views
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      {/* Player do YouTube */}
      <CardContent className={showInfo && title ? 'pt-0' : 'p-0'}>
        <div className="relative bg-black rounded-lg overflow-hidden">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onPlay={onPlay}
            onPause={onPause}
            onEnd={onEnd}
            className="youtube-player"
            iframeClassName="w-full h-full"
          />

          {/* Controles personalizados sobrepostos */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/50 rounded px-2 py-1 opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={openInYouTube}
              className="text-white hover:bg-white/20"
              title="Abrir no YouTube"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Descrição e tags */}
        {showInfo && (description || tags.length > 0) && (
          <div className="mt-4 space-y-3">
            {description && (
              <div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {description}
                </p>
              </div>
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 5).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {tags.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{tags.length - 5} mais
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente compacto para listas
export function CompactYouTubePlayer({
  videoId,
  title,
  channelTitle,
  duration,
  className = ''
}: {
  videoId: string;
  title?: string;
  channelTitle?: string;
  duration?: string;
  className?: string;
}) {
  const opts: YouTubeProps['opts'] = {
    height: '200',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <YouTube
          videoId={videoId}
          opts={opts}
          className="youtube-player-compact"
          iframeClassName="w-full h-full"
        />
        
        {duration && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2 text-xs bg-black/70 text-white"
          >
            {duration}
          </Badge>
        )}
      </div>
      
      {title && (
        <CardContent className="p-3">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{title}</h4>
          {channelTitle && (
            <p className="text-xs text-muted-foreground">{channelTitle}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Componente para playlist de vídeos
export function YouTubePlaylist({
  videos,
  title,
  className = ''
}: {
  videos: Array<{
    videoId: string;
    title?: string;
    channelTitle?: string;
    duration?: string;
    thumbnail?: string;
  }>;
  title?: string;
  className?: string;
}) {
  const [currentVideo, setCurrentVideo] = useState(0);

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Player principal */}
        <div className="lg:col-span-2">
          {videos[currentVideo] && (
            <YouTubePlayer
              videoId={videos[currentVideo].videoId}
              title={videos[currentVideo].title}
              channelTitle={videos[currentVideo].channelTitle}
              duration={videos[currentVideo].duration}
              showControls={true}
              showInfo={true}
            />
          )}
        </div>
        
        {/* Lista de vídeos */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Playlist ({videos.length} vídeos)</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {videos.map((video, index) => (
              <div
                key={video.videoId}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  index === currentVideo 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setCurrentVideo(index)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
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
                  <p className="text-sm font-medium line-clamp-2">
                    {video.title || 'Sem título'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {video.channelTitle || 'Canal desconhecido'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 