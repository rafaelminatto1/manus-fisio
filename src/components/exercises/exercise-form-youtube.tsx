'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoLibrary from '@/components/ui/video-library';
import YouTubeVideoPlayer from '@/components/ui/youtube-video-player';
import { YouTubeVideo } from '@/services/youtube-service';
import { Save, Video } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id?: string;
  name: string;
  description: string;
  category: string;
  bodyPart: string;
  videoUrl?: string;
  videoId?: string;
  videoTitle?: string;
}

interface ExerciseFormYouTubeProps {
  exercise?: Exercise;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export default function ExerciseFormYouTube({
  exercise,
  onSave,
  onCancel
}: ExerciseFormYouTubeProps) {
  const [formData, setFormData] = useState<Exercise>({
    name: exercise?.name || '',
    description: exercise?.description || '',
    category: exercise?.category || '',
    bodyPart: exercise?.bodyPart || '',
    videoUrl: exercise?.videoUrl || '',
    videoId: exercise?.videoId || '',
    videoTitle: exercise?.videoTitle || ''
  });

  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const updateField = (field: keyof Exercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setFormData(prev => ({
      ...prev,
      videoId: video.id,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      videoTitle: video.title
    }));
    toast.success('Vídeo selecionado!');
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="video">Vídeo</TabsTrigger>
        </TabsList>

        {/* Informações Básicas */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Exercício</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Exercício</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ex: Alongamento cervical"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="Ex: Alongamento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyPart">Parte do Corpo</Label>
                <Input
                  id="bodyPart"
                  value={formData.bodyPart}
                  onChange={(e) => updateField('bodyPart', e.target.value)}
                  placeholder="Ex: Cervical"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descreva o exercício..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vídeo */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Vídeo Demonstrativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVideo || formData.videoId ? (
                <div className="space-y-4">
                  <YouTubeVideoPlayer
                    videoId={selectedVideo?.id || formData.videoId || ''}
                    title={selectedVideo?.title || formData.videoTitle}
                    description={selectedVideo?.description}
                    channelTitle={selectedVideo?.channelTitle}
                    duration={selectedVideo?.duration}
                    showControls={true}
                    showInfo={true}
                  />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Vídeo:</strong> {selectedVideo?.title || formData.videoTitle}</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVideo(null);
                        setFormData(prev => ({
                          ...prev,
                          videoId: '',
                          videoUrl: '',
                          videoTitle: ''
                        }));
                      }}
                    >
                      Remover Vídeo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum vídeo selecionado</p>
                  </div>
                  
                  <VideoLibrary
                    patientCondition={formData.bodyPart}
                    onVideoSelect={handleVideoSelect}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Exercício
        </Button>
      </div>
    </div>
  );
} 