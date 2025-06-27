// ✅ CORREÇÃO CRÍTICA: Dashboard com verificação de autenticação

const loadDashboardDataFixed = async () => {
  try {
    setLoading(true)
    setError(null)

    // ✅ VERIFICAR AUTENTICAÇÃO ANTES DE CONSULTAS
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.warn('🔒 Usuário não autenticado, usando dados mock')
      setStats(mockStats)
      setActivities(mockActivities)
      setEvents(mockEvents)
      setLoading(false)
      return
    }

    // ✅ CONSULTAS COM TRATAMENTO DE ERRO
    const results = await Promise.allSettled([
      supabase.from('notebooks').select('id'),
      supabase.from('projects').select('id, status'),
      supabase.from('users').select('id, role'),
      supabase.from('tasks').select('id, status')
    ])

    // Extrair dados com segurança
    const notebooksData = results[0].status === 'fulfilled' ? results[0].value.data || [] : []
    const projectsData = results[1].status === 'fulfilled' ? results[1].value.data || [] : []
    const usersData = results[2].status === 'fulfilled' ? results[2].value.data || [] : []
    const tasksData = results[3].status === 'fulfilled' ? results[3].value.data || [] : []

    // Log erros sem quebrar
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(\Query \ failed:\, result.reason)
      }
    })

    // Calcular stats com dados seguros
    const totalNotebooks = notebooksData.length
    const totalProjects = projectsData.length
    const completedProjects = projectsData.filter(p => p.status === 'completed').length
    const totalTasks = tasksData.length
    const completedTasks = tasksData.filter(t => t.status === 'done').length
    const totalTeamMembers = usersData.length
    const activeInterns = usersData.filter(u => u.role === 'intern').length

    setStats({
      totalNotebooks,
      totalProjects,
      totalTasks,
      completedTasks,
      totalTeamMembers,
      activeInterns,
      upcomingEvents: 3,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    })

    // Usar dados mock para activities por enquanto
    setActivities(mockActivities)
    setEvents(mockEvents)

  } catch (err) {
    console.error('Dashboard data error:', err)
    setStats(mockStats)
    setActivities(mockActivities)
    setEvents(mockEvents)
  } finally {
    setLoading(false)
  }
}
