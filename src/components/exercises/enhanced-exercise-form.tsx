'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoLibrary from '@/components/ui/video-library';
import YouTubeVideoPlayer from '@/components/ui/youtube-video-player';
import { YouTubeVideo } from '@/services/youtube-service';
import { Save, Plus, Trash2, Video, Link, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id?: string;
  name: string;
  description: string;
  category: string;
  bodyPart: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  repetitions?: number;
  sets?: number;
  equipment: string[];
  instructions: string[];
  contraindications: string[];
  videoUrl?: string;
  videoId?: string;
  videoTitle?: string;
}

interface EnhancedExerciseFormProps {
  exercise?: Exercise;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export default function EnhancedExerciseForm({
  exercise,
  onSave,
  onCancel
}: EnhancedExerciseFormProps) {
  const [formData, setFormData] = useState<Exercise>({
    name: exercise?.name || '',
    description: exercise?.description || '',
    category: exercise?.category || '',
    bodyPart: exercise?.bodyPart || '',
    difficulty: exercise?.difficulty || 'beginner',
    duration: exercise?.duration || 0,
    repetitions: exercise?.repetitions || 0,
    sets: exercise?.sets || 0,
    equipment: exercise?.equipment || [],
    instructions: exercise?.instructions || [''],
    contraindications: exercise?.contraindications || [''],
    videoUrl: exercise?.videoUrl || '',
    videoId: exercise?.videoId || '',
    videoTitle: exercise?.videoTitle || ''
  });

  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [newEquipment, setNewEquipment] = useState('');

  // Categorias de exercícios
  const categories = [
    'Alongamento',
    'Fortalecimento',
    'Mobilidade',
    'Coordenação',
    'Equilíbrio',
    'Respiratório',
    'Cardiovascular',
    'Neurológico'
  ];

  // Partes do corpo
  const bodyParts = [
    'Cervical',
    'Ombro',
    'Braço',
    'Antebraço',
    'Mão',
    'Tórax',
    'Lombar',
    'Quadril',
    'Coxa',
    'Joelho',
    'Perna',
    'Pé',
    'Core',
    'Corpo Inteiro'
  ];

  // Atualizar campo do formulário
  const updateField = (field: keyof Exercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Adicionar nova instrução
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  // Remover instrução
  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  // Atualizar instrução específica
  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  // Adicionar nova contraindicação
  const addContraindication = () => {
    setFormData(prev => ({
      ...prev,
      contraindications: [...prev.contraindications, '']
    }));
  };

  // Remover contraindicação
  const removeContraindication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.filter((_, i) => i !== index)
    }));
  };

  // Atualizar contraindicação específica
  const updateContraindication = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.map((contra, i) => i === index ? value : contra)
    }));
  };

  // Adicionar equipamento
  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()]
      }));
      setNewEquipment('');
    }
  };

  // Remover equipamento
  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(eq => eq !== equipment)
    }));
  };

  // Selecionar vídeo do YouTube
  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setFormData(prev => ({
      ...prev,
      videoId: video.id,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      videoTitle: video.title
    }));
    toast.success('Vídeo selecionado com sucesso!');
  };

  // Salvar exercício
  const handleSave = () => {
    // Validações básicas
    if (!formData.name.trim()) {
      toast.error('Nome do exercício é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (!formData.category) {
      toast.error('Categoria é obrigatória');
      return;
    }

    if (!formData.bodyPart) {
      toast.error('Parte do corpo é obrigatória');
      return;
    }

    // Filtrar instruções e contraindicações vazias
    const cleanedData = {
      ...formData,
      instructions: formData.instructions.filter(inst => inst.trim()),
      contraindications: formData.contraindications.filter(contra => contra.trim())
    };

    onSave(cleanedData);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="video">Vídeo</TabsTrigger>
          <TabsTrigger value="safety">Segurança</TabsTrigger>
        </TabsList>

        {/* Informações Básicas */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas do Exercício</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Exercício *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Ex: Alongamento cervical lateral"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyPart">Parte do Corpo *</Label>
                  <Select value={formData.bodyPart} onValueChange={(value) => updateField('bodyPart', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a parte do corpo" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyParts.map(part => (
                        <SelectItem key={part} value={part}>
                          {part}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => updateField('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descreva o exercício, seus benefícios e objetivo..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detalhes */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parâmetros do exercício */}
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros do Exercício</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (segundos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repetitions">Repetições</Label>
                    <Input
                      id="repetitions"
                      type="number"
                      value={formData.repetitions}
                      onChange={(e) => updateField('repetitions', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sets">Séries</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={formData.sets}
                      onChange={(e) => updateField('sets', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos Necessários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="Ex: Theraband, Bola suíça..."
                    onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                  />
                  <Button onClick={addEquipment} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.equipment.map((equipment, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeEquipment(equipment)}
                    >
                      {equipment}
                      <Trash2 className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle>Instruções Passo a Passo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Passo ${index + 1}...`}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    disabled={formData.instructions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button onClick={addInstruction} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Passo
              </Button>
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
                      <p><strong>Canal:</strong> {selectedVideo?.channelTitle}</p>
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
                    <p className="text-sm">Busque e selecione um vídeo demonstrativo abaixo</p>
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

        {/* Segurança */}
        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Contraindicações e Precauções
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.contraindications.map((contraindication, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={contraindication}
                      onChange={(e) => updateContraindication(index, e.target.value)}
                      placeholder={`Contraindicação ${index + 1}...`}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeContraindication(index)}
                    disabled={formData.contraindications.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button onClick={addContraindication} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contraindicação
              </Button>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h4>
                <p className="text-yellow-700 text-sm">
                  Sempre liste todas as contraindicações conhecidas para garantir a segurança do paciente.
                  Em caso de dúvidas, consulte literatura especializada ou outros profissionais.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de ação */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {exercise ? 'Atualizar Exercício' : 'Criar Exercício'}
        </Button>
      </div>
    </div>
  );
} 