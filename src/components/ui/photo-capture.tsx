'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Camera, 
  Upload, 
  Trash2, 
  Eye,
  Shield,
  Check,
  X,
  RotateCcw,
  Download
} from 'lucide-react'

interface PhotoData {
  id: string
  url: string
  date: string
  type: 'initial' | 'progress' | 'final'
  description: string
  region: string
  consentGiven: boolean
  patientConsent?: {
    date: string
    ipAddress: string
    signature: string
  }
}

interface PhotoCaptureProps {
  patientId: string
  patientName: string
  onSavePhoto?: (photo: PhotoData) => void
  existingPhotos?: PhotoData[]
  className?: string
}

export function PhotoCapture({ 
  patientId, 
  patientName, 
  onSavePhoto, 
  existingPhotos = [],
  className 
}: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [photoDescription, setPhotoDescription] = useState('')
  const [photoRegion, setPhotoRegion] = useState('')
  const [photoType, setPhotoType] = useState<'initial' | 'progress' | 'final'>('progress')
  const [consentGiven, setConsentGiven] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const regions = [
    'Cervical',
    'Ombro Direito',
    'Ombro Esquerdo',
    'Tórax',
    'Lombar',
    'Quadril',
    'Joelho Direito',
    'Joelho Esquerdo',
    'Tornozelo',
    'Postura Geral'
  ]

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert('Erro ao acessar a câmera. Verifique as permissões.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedPhoto(dataURL)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const savePhoto = () => {
    if (!capturedPhoto || !consentGiven) {
      setShowConsentModal(true)
      return
    }

    const newPhoto: PhotoData = {
      id: Date.now().toString(),
      url: capturedPhoto,
      date: new Date().toISOString(),
      type: photoType,
      description: photoDescription,
      region: photoRegion,
      consentGiven: true,
      patientConsent: {
        date: new Date().toISOString(),
        ipAddress: 'xxx.xxx.xxx.xxx', // Em produção, capturar IP real
        signature: `Consentimento digital - ${patientName}`
      }
    }

    onSavePhoto?.(newPhoto)
    resetForm()
  }

  const resetForm = () => {
    setCapturedPhoto(null)
    setPhotoDescription('')
    setPhotoRegion('')
    setPhotoType('progress')
    setConsentGiven(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'initial': return 'bg-blue-100 text-blue-800'
      case 'progress': return 'bg-yellow-100 text-yellow-800'
      case 'final': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'initial': return 'Inicial'
      case 'progress': return 'Evolução'
      case 'final': return 'Final/Alta'
      default: return type
    }
  }

  return (
    <div className={className}>
      {/* Modal de Consentimento */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consentimento para Uso de Imagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">📷 Termo de Consentimento</p>
                  <p>
                    Autorizo o uso da minha imagem para fins terapêuticos e de 
                    acompanhamento do tratamento fisioterapêutico, conforme 
                    estabelecido pela LGPD.
                  </p>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• As imagens serão usadas exclusivamente para fins médicos</p>
                  <p>• Dados armazenados com segurança e criptografia</p>
                  <p>• Você pode revogar o consentimento a qualquer momento</p>
                  <p>• Paciente: <strong>{patientName}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="consent" className="text-sm">
                    Concordo com os termos acima
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConsentModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConsentModal(false)
                      if (consentGiven) savePhoto()
                    }}
                    disabled={!consentGiven}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {/* Captura de Nova Foto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Registrar Foto de Evolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCamera && !capturedPhoto && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo de Registro</Label>
                    <select
                      value={photoType}
                      onChange={(e) => setPhotoType(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="initial">Avaliação Inicial</option>
                      <option value="progress">Evolução</option>
                      <option value="final">Final/Alta</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label>Região Anatômica</Label>
                    <select
                      value={photoRegion}
                      onChange={(e) => setPhotoRegion(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione...</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={photoDescription}
                      onChange={(e) => setPhotoDescription(e.target.value)}
                      placeholder="Ex: Vista anterior, flexão..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <EnhancedButton
                    onClick={startCamera}
                    leftIcon={<Camera className="h-4 w-4" />}
                    variant="medical"
                  >
                    Usar Câmera
                  </EnhancedButton>
                  
                  <EnhancedButton
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="h-4 w-4" />}
                    variant="outline"
                  >
                    Carregar Arquivo
                  </EnhancedButton>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Câmera Ativa */}
            {showCamera && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-lg mx-auto rounded-lg"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 rounded-lg"></div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <EnhancedButton
                    onClick={capturePhoto}
                    leftIcon={<Camera className="h-4 w-4" />}
                    size="lg"
                  >
                    Capturar
                  </EnhancedButton>
                  
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Foto Capturada */}
            {capturedPhoto && (
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={capturedPhoto}
                    alt="Foto capturada"
                    className="max-w-sm mx-auto rounded-lg border"
                  />
                </div>
                
                <div className="flex gap-4 justify-center">
                  <EnhancedButton
                    onClick={savePhoto}
                    leftIcon={<Check className="h-4 w-4" />}
                    variant="medical"
                    disabled={!photoRegion || !photoDescription}
                  >
                    Salvar Foto
                  </EnhancedButton>
                  
                  <Button
                    onClick={() => setCapturedPhoto(null)}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nova Foto
                  </Button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Galeria de Fotos */}
        {existingPhotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg p-3">
                    <div className="relative mb-3">
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${getTypeColor(photo.type)}`}
                      >
                        {getTypeLabel(photo.type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">{photo.region}</div>
                      <div className="text-gray-600">{photo.description}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(photo.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 