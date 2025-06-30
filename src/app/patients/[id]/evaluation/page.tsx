'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PainScale, CompactPainScale } from '@/components/ui/pain-scale'
import { Goniometer } from '@/components/ui/goniometer'
import { FunctionalTests } from '@/components/ui/functional-tests'
import { ArrowLeft, Save, FileText, Activity, TestTube, Ruler } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EvaluationData {
  patientId: string
  patientName: string
  date: string
  painScale: number
  goniometryReadings: any[]
  functionalTestResults: any[]
  notes: string
}

export default function PatientEvaluation({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    patientId: params.id,
    patientName: 'Maria Silva', // Mock data
    date: new Date().toISOString().split('T')[0],
    painScale: 0,
    goniometryReadings: [],
    functionalTestResults: [],
    notes: ''
  })

  const [activeTab, setActiveTab] = useState('pain')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveEvaluation = async () => {
    setIsSaving(true)
    try {
      // Aqui faria a requisição para salvar a avaliação
      await new Promise(resolve => setTimeout(resolve, 2000)) // Mock delay
      console.log('Avaliação salva:', evaluationData)
      router.push(`/patients/${params.id}`)
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePainScaleChange = (value: number) => {
    setEvaluationData(prev => ({ ...prev, painScale: value }))
  }

  const handleGoniometryReading = (reading: any) => {
    setEvaluationData(prev => ({
      ...prev,
      goniometryReadings: [...prev.goniometryReadings, reading]
    }))
  }

  const handleFunctionalTestResult = (result: any) => {
    setEvaluationData(prev => ({
      ...prev,
      functionalTestResults: [...prev.functionalTestResults, result]
    }))
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/patients/${params.id}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Avaliação Fisioterapêutica</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Paciente: {evaluationData.patientName}
                  </p>
                </div>
              </div>

              {/* Info rápida */}
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Data: {new Date(evaluationData.date).toLocaleDateString('pt-BR')}
                </Badge>
                <CompactPainScale
                  value={evaluationData.painScale}
                  onChange={handlePainScaleChange}
                />
                <Badge variant="secondary">
                  {evaluationData.goniometryReadings.length} medições
                </Badge>
                <Badge variant="secondary">
                  {evaluationData.functionalTestResults.length} testes
                </Badge>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pain" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Escala de Dor
                </TabsTrigger>
                <TabsTrigger value="goniometry" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Goniometria
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testes Funcionais
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </TabsTrigger>
              </TabsList>

              {/* Escala de Dor */}
              <TabsContent value="pain">
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliação da Dor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PainScale
                      value={evaluationData.painScale}
                      onChange={handlePainScaleChange}
                      showEmojis={true}
                      showNumbers={true}
                      showLabels={true}
                      size="lg"
                    />
                    
                    {evaluationData.painScale > 0 && (
                      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 className="font-medium mb-2">Características da Dor:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Localização:</label>
                            <input 
                              type="text" 
                              className="w-full p-2 border rounded-md" 
                              placeholder="Ex: região lombar, ombro direito..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Tipo de dor:</label>
                            <select className="w-full p-2 border rounded-md">
                              <option>Selecione...</option>
                              <option>Pontada</option>
                              <option>Queimação</option>
                              <option>Latejante</option>
                              <option>Peso</option>
                              <option>Formigamento</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Quando piora:</label>
                            <input 
                              type="text" 
                              className="w-full p-2 border rounded-md" 
                              placeholder="Ex: movimento, repouso, manhã..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Quando melhora:</label>
                            <input 
                              type="text" 
                              className="w-full p-2 border rounded-md" 
                              placeholder="Ex: calor, medicamento, alongamento..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goniometria */}
              <TabsContent value="goniometry">
                <div className="space-y-6">
                  <Goniometer onSave={handleGoniometryReading} />
                  
                  {/* Histórico de medições */}
                  {evaluationData.goniometryReadings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Medições Realizadas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {evaluationData.goniometryReadings.map((reading, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium">
                                  {reading.joint} - {reading.movement}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Ativo: {reading.activeRom}° | Passivo: {reading.passiveRom}°
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Testes Funcionais */}
              <TabsContent value="tests">
                <FunctionalTests 
                  onSaveResult={handleFunctionalTestResult}
                  patientResults={evaluationData.functionalTestResults}
                />
              </TabsContent>

              {/* Observações */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Observações da Avaliação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Queixa Principal:
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-md h-20"
                          placeholder="Descreva a queixa principal do paciente..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          História da Doença Atual:
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-md h-24"
                          placeholder="Como iniciou, evolução, tratamentos anteriores..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Exame Físico - Inspeção:
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-md h-20"
                          placeholder="Postura, marcha, deformidades..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Diagnóstico Fisioterapêutico:
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-md h-20"
                          placeholder="Diagnóstico funcional e objetivos do tratamento..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Plano de Tratamento:
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-md h-24"
                          placeholder="Recursos a serem utilizados, frequência, objetivos..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push(`/patients/${params.id}`)}
              >
                Cancelar
              </Button>
              <EnhancedButton
                onClick={handleSaveEvaluation}
                loading={isSaving}
                loadingText="Salvando..."
                leftIcon={<Save className="h-4 w-4" />}
                variant="medical"
                size="lg"
              >
                Salvar Avaliação
              </EnhancedButton>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 