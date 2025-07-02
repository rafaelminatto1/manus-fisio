'use client';

import { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  channelTitle?: string;
  duration?: string;
  autoplay?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  className?: string;
}

export default function YouTubeVideoPlayer({
  videoId,
  title,
  description,
  channelTitle,
  duration,
  autoplay = false,
  showControls = true,
  showInfo = true,
  className = ''
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Configurações do player YouTube
  const opts: YouTubeProps['opts'] = {
    height: '315',
    width: '100%',
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      controls: showControls ? 1 : 0,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const onEnd = () => setIsPlaying(false);

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {showInfo && title && (
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2 mb-1">{title}</CardTitle>
              {channelTitle && (
                <p className="text-sm text-muted-foreground">{channelTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {duration && (
                <Badge variant="secondary" className="text-xs">
                  {duration}
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={openInYouTube}
                title="Abrir no YouTube"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={showInfo && title ? 'pt-0' : 'p-0'}>
        <div className="relative bg-black rounded-lg overflow-hidden">
          <YouTube
            videoId={videoId}
            opts={opts}
            onPlay={onPlay}
            onPause={onPause}
            onEnd={onEnd}
            className="youtube-player"
            iframeClassName="w-full h-full"
          />
        </div>

        {showInfo && description && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente compacto
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