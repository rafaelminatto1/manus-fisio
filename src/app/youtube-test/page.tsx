'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoLibrary from '@/components/ui/video-library';
import YouTubeVideoPlayer, { CompactYouTubePlayer } from '@/components/ui/youtube-video-player';
import YouTubeService, { YouTubeVideo } from '@/services/youtube-service';
import { Play, Search, Youtube, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function YouTubeTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [customVideoId, setCustomVideoId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Testes da integração YouTube
  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Verificar Configuração da API',
        test: () => {
          const hasApiKey = !!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
          return {
            success: hasApiKey,
            message: hasApiKey 
              ? 'API Key configurada' 
              : 'API Key não encontrada - usando dados mock'
          };
        }
      },
      {
        name: 'Buscar Vídeos de Fisioterapia',
        test: async () => {
          try {
            const videos = await YouTubeService.searchVideos({
              query: 'exercícios fisioterapia',
              maxResults: 5
            });
            return {
              success: videos.length > 0,
              message: `${videos.length} vídeos encontrados`,
              data: videos
            };
          } catch (error) {
            return {
              success: false,
              message: `Erro na busca: ${error}`
            };
          }
        }
      },
      {
        name: 'Buscar Vídeos por Condição',
        test: async () => {
          try {
            const videos = await YouTubeService.searchPhysiotherapyVideos('lombalgia');
            return {
              success: videos.length > 0,
              message: `${videos.length} vídeos para lombalgia encontrados`,
              data: videos
            };
          } catch (error) {
            return {
              success: false,
              message: `Erro na busca por condição: ${error}`
            };
          }
        }
      },
      {
        name: 'Validar URL do YouTube',
        test: () => {
          const testUrls = [
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'https://youtu.be/dQw4w9WgXcQ',
            'https://example.com/video'
          ];
          
          const results = testUrls.map(url => ({
            url,
            isValid: YouTubeService.isYouTubeUrl(url)
          }));
          
          const validCount = results.filter(r => r.isValid).length;
          
          return {
            success: validCount === 2, // Primeiras 2 devem ser válidas
            message: `${validCount}/3 URLs validadas corretamente`,
            data: results
          };
        }
      },
      {
        name: 'Extrair ID do Vídeo',
        test: () => {
          const testCases = [
            {
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              expectedId: 'dQw4w9WgXcQ'
            },
            {
              url: 'https://youtu.be/oHg5SJYRHA0',
              expectedId: 'oHg5SJYRHA0'
            }
          ];
          
          const results = testCases.map(({ url, expectedId }) => {
            const extractedId = YouTubeService.extractVideoId(url);
            return {
              url,
              expectedId,
              extractedId,
              success: extractedId === expectedId
            };
          });
          
          const successCount = results.filter(r => r.success).length;
          
          return {
            success: successCount === testCases.length,
            message: `${successCount}/${testCases.length} IDs extraídos corretamente`,
            data: results
          };
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        setTestResults(prev => [...prev, {
          name: test.name,
          ...result,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          success: false,
          message: `Erro no teste: ${error}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    }
    
    setIsLoading(false);
    toast.success('Testes concluídos!');
  };

  // Buscar vídeos personalizados
  const handleCustomSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const videos = await YouTubeService.searchVideos({
        query: searchQuery,
        maxResults: 8
      });
      
      if (videos.length > 0) {
        setSelectedVideo(videos[0] || null);
        toast.success(`${videos.length} vídeos encontrados`);
      } else {
        toast.error('Nenhum vídeo encontrado');
      }
    } catch (error) {
      toast.error('Erro na busca');
    }
  };

  // Testar vídeo específico
  const testCustomVideo = () => {
    if (!customVideoId.trim()) return;
    
    const videoId = YouTubeService.extractVideoId(customVideoId) || customVideoId;
    
    setSelectedVideo({
      id: videoId,
      title: 'Vídeo de Teste',
      description: 'Vídeo carregado para teste',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      channelTitle: 'Canal de Teste',
      publishedAt: new Date().toISOString()
    });
    
    toast.success('Vídeo carregado para teste');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Youtube className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold">Teste YouTube Integration</h1>
          <TestTube className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-muted-foreground">
          Interface de teste para verificar a integração com YouTube
        </p>
      </div>

      {/* Status da API */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600">API Key configurada</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-orange-500" />
                <span className="text-orange-600">Usando dados mock (sem API Key)</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controles de Teste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Controles de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Vídeos:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: exercícios ombro"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
                />
                <Button onClick={handleCustomSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Testar Vídeo Específico:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="ID do vídeo ou URL"
                  value={customVideoId}
                  onChange={(e) => setCustomVideoId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && testCustomVideo()}
                />
                <Button onClick={testCustomVideo}>
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exemplos:</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomVideoId('dQw4w9WgXcQ')}
                >
                  Exemplo 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomVideoId('oHg5SJYRHA0')}
                >
                  Exemplo 2
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player */}
        <Card>
          <CardHeader>
            <CardTitle>Player de Teste</CardTitle>
          </CardHeader>
          <CardContent>
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
                
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {selectedVideo.id}</p>
                  <p><strong>Canal:</strong> {selectedVideo.channelTitle}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum vídeo selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biblioteca de Vídeos */}
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Vídeos</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoLibrary
            onVideoSelect={(video) => {
              setSelectedVideo(video);
              toast.success(`Vídeo selecionado: ${video.title}`);
            }}
          />
        </CardContent>
      </Card>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar a API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Passos para configurar:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Acesse o Google Cloud Console</li>
              <li>Crie um projeto e ative a YouTube Data API v3</li>
              <li>Gere uma API Key</li>
              <li>Adicione no arquivo .env.local:</li>
            </ol>
            
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
              NEXT_PUBLIC_YOUTUBE_API_KEY=sua_api_key_aqui
            </div>
          </div>

          <Badge variant="secondary">
            💡 O sistema funciona com dados mock mesmo sem API Key
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
} 