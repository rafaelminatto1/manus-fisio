'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PainScale, CompactPainScale } from '@/components/ui/pain-scale'
import { Goniometer } from '@/components/ui/goniometer'
import { FunctionalTests } from '@/components/ui/functional-tests'
import { PhotoCapture } from '@/components/ui/photo-capture'
import { toast } from 'sonner'
import { usePatientEvaluation } from '@/hooks/use-patient-evaluation'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, Save, FileText, Activity, TestTube, Ruler, Camera, 
  User, Target, AlertCircle, Stethoscope, CheckCircle 
} from 'lucide-react'

// A interface de dados local foi removida, pois agora usamos a do hook.

export default function PatientEvaluationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const patientId = params.id
  // Permite carregar uma avaliação específica para edição
  const evaluationId = searchParams.get('evaluationId') || undefined

  const {
    evaluationData,
    setEvaluationData,
    patientName,
    loading,
    isSaving,
    error,
    saveEvaluation
  } = usePatientEvaluation(patientId, evaluationId)
  
  const [activeTab, setActiveTab] = useState('anamnesis')

  const handleSaveEvaluation = async () => {
    if (!evaluationData) {
      toast.error('Não há dados de avaliação para salvar.')
      return
    }
    const savedEvaluation = await saveEvaluation(evaluationData)
    if (savedEvaluation) {
      // Redireciona para a página do paciente após salvar
      router.push(`/patients/${patientId}`)
    }
  }

  const handlePainScaleChange = (value: number) => {
    if (!setEvaluationData) return
    setEvaluationData(prev => (prev ? { ...prev, pain_scale: value } : null))
  }

  const handleGoniometryReading = (reading: any) => {
    if (!setEvaluationData) return
    setEvaluationData(prev => {
      if (!prev) return null
      const updatedReadings = [...(prev.range_of_motion || []), reading]
      return { ...prev, range_of_motion: updatedReadings }
    })
    toast.success('📐 Medição goniométrica adicionada')
  }

  const handleFunctionalTestResult = (testName: string, result: any) => {
    if (!setEvaluationData) return
    setEvaluationData(prev => {
      if (!prev) return null
      const updatedTests = [...(prev.functional_tests || []), { testName, ...result }]
      return { ...prev, functional_tests: updatedTests }
    })
    toast.success(`🧪 Teste ${testName} registrado`)
  }

  const handlePhotoSaved = (photoData: any) => {
    toast.success('📷 Foto salva com sucesso', {
      description: 'Imagem adicionada ao prontuário'
    })
    // Futuramente, pode-se salvar metadados da foto na avaliação
  }

  const getCompletionPercentage = () => {
    if (!evaluationData) return 0
    const fields = [
      evaluationData.main_complaint,
      (evaluationData.pain_scale || 0) > 0,
      (evaluationData.range_of_motion?.length || 0) > 0,
      (evaluationData.functional_tests?.length || 0) > 0,
      evaluationData.physiotherapy_diagnosis
    ]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-10 w-24" />
              <div>
                <Skeleton className="h-8 w-96 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-16 w-full mb-6" />
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-4 text-xl font-semibold text-red-600">Erro ao Carregar Avaliação</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button onClick={() => router.back()} className="mt-6">Voltar</Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }
  
  if (!evaluationData) {
    return (
       <AuthGuard>
        <DashboardLayout>
          <div className="p-6 text-center">
             <h2 className="mt-4 text-xl font-semibold">Avaliação não encontrada</h2>
             <Button onClick={() => router.back()} className="mt-6">Voltar</Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/patients/${patientId}`)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      🏥 Avaliação Fisioterapêutica Completa
                    </h1>
                    <p className="text-muted-foreground">
                      Paciente: {patientName} • {new Date(evaluationData.evaluation_date || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm">
                    {getCompletionPercentage()}% completo
                  </Badge>
                  <EnhancedButton
                    onClick={handleSaveEvaluation}
                    loading={isSaving}
                    disabled={!evaluationData.main_complaint || isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Avaliação
                  </EnhancedButton>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <CompactPainScale
                  value={evaluationData.pain_scale || 0}
                  onChange={handlePainScaleChange}
                />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {evaluationData.range_of_motion?.length || 0} medições
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TestTube className="h-3 w-3" />
                  {evaluationData.functional_tests?.length || 0} testes
                </Badge>
                {evaluationData.physiotherapy_diagnosis && (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Diagnóstico definido
                  </Badge>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="anamnesis" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Anamnese
                </TabsTrigger>
                <TabsTrigger value="pain" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Dor
                </TabsTrigger>
                <TabsTrigger value="goniometry" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Goniometria
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testes
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotos
                </TabsTrigger>
                <TabsTrigger value="diagnosis" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Diagnóstico e Plano
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="anamnesis">
                <Card>
                  <CardHeader>
                    <CardTitle>Anamnese Detalhada</CardTitle>
                    <CardDescription>Entenda o histórico completo do paciente.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="main_complaint">Queixa Principal</Label>
                      <Textarea
                        id="main_complaint"
                        placeholder="Ex: Dor lombar intensa ao sentar por mais de 30 minutos."
                        value={evaluationData.main_complaint || ''}
                        onChange={(e) => setEvaluationData(prev => prev ? { ...prev, main_complaint: e.target.value } : null)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medical_history">História Médica Pregressa</Label>
                      <Textarea
                        id="medical_history"
                        placeholder="Ex: Cirurgia de hérnia de disco em 2021, hipertensão controlada."
                        value={evaluationData.medical_history || ''}
                        onChange={(e) => setEvaluationData(prev => prev ? { ...prev, medical_history: e.target.value } : null)}
                        className="min-h-[100px]"
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="previous_treatments">Tratamentos Anteriores</Label>
                      <Textarea
                        id="previous_treatments"
                        placeholder="Ex: Realizou 10 sessões de fisioterapia em 2022 com melhora parcial."
                        value={evaluationData.previous_treatments || ''}
                        onChange={(e) => setEvaluationData(prev => prev ? { ...prev, previous_treatments: e.target.value } : null)}
                      />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="medications">Medicamentos em Uso</Label>
                          <Input
                            id="medications"
                            placeholder="Ex: Losartana 50mg, Ibuprofeno 400mg se dor"
                            value={evaluationData.medications || ''}
                            onChange={(e) => setEvaluationData(prev => prev ? { ...prev, medications: e.target.value } : null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lifestyle_factors">Fatores de Estilo de Vida</Label>
                          <Input
                            id="lifestyle_factors"
                            placeholder="Ex: Sedentário, trabalha 8h/dia sentado"
                            value={evaluationData.lifestyle_factors || ''}
                            onChange={(e) => setEvaluationData(prev => prev ? { ...prev, lifestyle_factors: e.target.value } : null)}
                          />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pain">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliação da Dor</CardTitle>
                      <CardDescription>Use a escala visual para quantificar a dor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PainScale value={evaluationData.pain_scale || 0} onChange={handlePainScaleChange} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Caracterização da Dor</CardTitle>
                      <CardDescription>Detalhes sobre a natureza da dor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pain_location">Localização da Dor</Label>
                        <Input id="pain_location" placeholder="Ex: Região lombar direita com irradiação para glúteo" 
                          value={evaluationData.pain_location || ''}
                          onChange={(e) => setEvaluationData(prev => prev ? { ...prev, pain_location: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pain_characteristics">Características da Dor</Label>
                        <Input id="pain_characteristics" placeholder="Ex: Queimação, pontada, contínua" 
                          value={evaluationData.pain_characteristics || ''}
                          onChange={(e) => setEvaluationData(prev => prev ? { ...prev, pain_characteristics: e.target.value } : null)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pain_triggers">Fatores Agravantes</Label>
                          <Input id="pain_triggers" placeholder="Ex: Ficar sentado, dirigir" 
                            value={evaluationData.pain_triggers || ''}
                            onChange={(e) => setEvaluationData(prev => prev ? { ...prev, pain_triggers: e.target.value } : null)}
                           />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pain_relief">Fatores de Alívio</Label>
                          <Input id="pain_relief" placeholder="Ex: Deitar, caminhar" 
                            value={evaluationData.pain_relief || ''}
                            onChange={(e) => setEvaluationData(prev => prev ? { ...prev, pain_relief: e.target.value } : null)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goniometry">
                <Card>
                  <CardHeader>
                    <CardTitle>Goniometria Digital</CardTitle>
                    <CardDescription>Meça a amplitude de movimento das articulações.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Goniometer onSave={handleGoniometryReading} />
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Medições Registradas</h4>
                      {evaluationData.range_of_motion && evaluationData.range_of_motion.length > 0 ? (
                        <ul className="space-y-2">
                          {evaluationData.range_of_motion.map((reading, index) => (
                             <li key={index} className="text-sm p-2 border rounded-md bg-muted/50">
                               {reading.joint} ({reading.movement}): {reading.value}°
                             </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma medição registrada.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tests">
                <Card>
                  <CardHeader>
                    <CardTitle>Testes Funcionais e Específicos</CardTitle>
                    <CardDescription>Realize testes padronizados para avaliação.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FunctionalTests onTestResult={handleFunctionalTestResult} />
                     <div className="mt-6">
                      <h4 className="font-semibold mb-2">Testes Realizados</h4>
                      {evaluationData.functional_tests && evaluationData.functional_tests.length > 0 ? (
                        <ul className="space-y-2">
                          {evaluationData.functional_tests.map((test, index) => (
                             <li key={index} className="text-sm p-2 border rounded-md bg-muted/50">
                               <strong>{test.testName}:</strong> {test.result}
                             </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum teste realizado.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentação Fotográfica</CardTitle>
                    <CardDescription>Capture fotos posturais e de evolução (LGPD Compliant).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoCapture patientId={patientId} onSave={handlePhotoSaved} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diagnosis">
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnóstico e Plano de Tratamento</CardTitle>
                    <CardDescription>Defina o diagnóstico, metas e o plano terapêutico.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="physiotherapy_diagnosis">Diagnóstico Fisioterapêutico</Label>
                      <Textarea 
                        id="physiotherapy_diagnosis" 
                        placeholder="Ex: Síndrome dolorosa miofascial em quadrado lombar e glúteo médio à direita."
                        value={evaluationData.physiotherapy_diagnosis || ''}
                        onChange={(e) => setEvaluationData(prev => prev ? { ...prev, physiotherapy_diagnosis: e.target.value } : null)}
                        className="min-h-[100px]"
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="treatment_goals">Metas do Tratamento (separadas por vírgula)</Label>
                       <Input 
                        id="treatment_goals" 
                        placeholder="Ex: Reduzir dor de 7 para 2, melhorar ADM de flexão lombar"
                        value={Array.isArray(evaluationData.treatment_goals) ? evaluationData.treatment_goals.join(', ') : ''}
                        onChange={(e) => setEvaluationData(prev => prev ? { ...prev, treatment_goals: e.target.value.split(',').map(s => s.trim()) } : null)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="estimated_sessions">Sessões Estimadas</Label>
                         <Input 
                          id="estimated_sessions" 
                          type="number"
                          value={evaluationData.estimated_sessions || 10}
                          onChange={(e) => setEvaluationData(prev => prev ? { ...prev, estimated_sessions: parseInt(e.target.value) } : null)}
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="frequency_per_week">Frequência Semanal</Label>
                         <Input 
                          id="frequency_per_week" 
                          type="number"
                          value={evaluationData.frequency_per_week || 2}
                          onChange={(e) => setEvaluationData(prev => prev ? { ...prev, frequency_per_week: parseInt(e.target.value) } : null)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 