'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  Calendar, 
  BookOpen, 
  FolderKanban, 
  Settings,
  ArrowRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function PublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Manus Fisio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                ✅ Sistema Online
              </Badge>
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Entrar no Sistema
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Sistema de Gestão Integrado
            <span className="block text-blue-400 mt-2">para Clínica de Fisioterapia</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gestão de mentoria, projetos e colaboração em clínicas de fisioterapia. 
            Desenvolvido com Next.js 14, TypeScript e Supabase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Acessar Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Saber Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Funcionalidades Principais
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-white">Sistema de Notebooks</CardTitle>
                <CardDescription className="text-slate-400">
                  Editor rico para documentação e anotações clínicas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <FolderKanban className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-white">Gestão de Projetos</CardTitle>
                <CardDescription className="text-slate-400">
                  Kanban board para organização de tarefas e projetos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-white">Gestão de Equipe</CardTitle>
                <CardDescription className="text-slate-400">
                  Controle de mentores, estagiários e colaboradores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Calendar className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle className="text-white">Calendário</CardTitle>
                <CardDescription className="text-slate-400">
                  Agendamento de supervisões e eventos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="text-white">Segurança LGPD</CardTitle>
                <CardDescription className="text-slate-400">
                  Conformidade com regulamentações de privacidade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Settings className="h-8 w-8 text-cyan-500 mb-2" />
                <CardTitle className="text-white">Configurações</CardTitle>
                <CardDescription className="text-slate-400">
                  Personalização completa do sistema
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Tecnologias Utilizadas
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="text-white">Frontend Moderno</CardTitle>
                <CardDescription className="text-slate-400">
                  Next.js 14, TypeScript, Tailwind CSS, Radix UI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-white">Backend Robusto</CardTitle>
                <CardDescription className="text-slate-400">
                  Supabase, PostgreSQL, Row Level Security, Real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-white">Deploy Seguro</CardTitle>
                <CardDescription className="text-slate-400">
                  Vercel, SSL/HTTPS, PWA, Deploy Automático
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">100%</div>
              <div className="text-slate-400">Funcional</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">12</div>
              <div className="text-slate-400">Páginas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">PWA</div>
              <div className="text-slate-400">Instalável</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-slate-400">Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Pronto para começar?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Acesse o sistema completo e explore todas as funcionalidades disponíveis.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              Entrar no Sistema
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 px-4 border-t border-slate-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-blue-500" />
            <span className="text-white font-semibold">Manus Fisio</span>
          </div>
          <p className="text-slate-400 text-sm">
            Sistema de Gestão Integrado para Clínica de Fisioterapia
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Desenvolvido com Next.js 14 + TypeScript + Supabase
          </p>
        </div>
      </footer>
    </div>
  )
} 