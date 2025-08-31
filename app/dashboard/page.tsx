'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  avgProgress: number
  totalKPIs: number
  alertKPIs: number
}

interface TasksByStatus {
  status: string
  count: number
  color: string
}

interface KPIPerformance {
  name: string
  current: number
  target: number
  percentage: number
}

const COLORS = {
  completed: '#10B981',
  in_progress: '#3B82F6', 
  pending: '#F59E0B',
  cancelled: '#EF4444'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    avgProgress: 0,
    totalKPIs: 0,
    alertKPIs: 0
  })
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus[]>([])
  const [kpiPerformance, setKpiPerformance] = useState<KPIPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load tasks data
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')

      if (tasks) {
        const totalTasks = tasks.length
        const completedTasks = tasks.filter(t => t.status === 'completed').length
        const pendingTasks = tasks.filter(t => t.status === 'pending').length
        const overdueTasks = tasks.filter(t => 
          t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
        ).length
        const avgProgress = tasks.length > 0 
          ? Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)
          : 0

        // Tasks by status for chart
        const statusCounts = tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const tasksByStatusData = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.replace('_', ' ').toUpperCase(),
          count,
          color: COLORS[status as keyof typeof COLORS] || '#6B7280'
        }))

        setStats(prev => ({
          ...prev,
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          avgProgress
        }))
        setTasksByStatus(tasksByStatusData)
      }

      // Load KPIs data
      const { data: kpis } = await supabase
        .from('kpis')
        .select('*')

      if (kpis) {
        const totalKPIs = kpis.length
        const alertKPIs = kpis.filter(kpi => 
          (kpi.current_value / kpi.target_value) * 100 < kpi.threshold_warning
        ).length

        const kpiPerformanceData = kpis.slice(0, 6).map(kpi => ({
          name: kpi.name.length > 20 ? kpi.name.substring(0, 20) + '...' : kpi.name,
          current: kpi.current_value,
          target: kpi.target_value,
          percentage: Math.round((kpi.current_value / kpi.target_value) * 100)
        }))

        setStats(prev => ({
          ...prev,
          totalKPIs,
          alertKPIs
        }))
        setKpiPerformance(kpiPerformanceData)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 bg-gray-200 rounded-lg" />
          <div className="h-80 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.username}. Aquí tienes un resumen de tu actividad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            {user?.area}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <Progress value={stats.avgProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Vencidas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPIs en Alerta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.alertKPIs}</div>
            <p className="text-xs text-muted-foreground">
              De {stats.totalKPIs} KPIs totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tareas</CardTitle>
            <CardDescription>
              Estado actual de todas las tareas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KPI Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento KPIs</CardTitle>
            <CardDescription>
              Porcentaje de cumplimiento vs objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 150]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    name === 'percentage' ? 'Cumplimiento' : name
                  ]}
                />
                <Bar dataKey="percentage" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/dashboard/tasks'}>
          <CardHeader className="text-center">
            <CheckSquare className="h-8 w-8 mx-auto text-blue-600" />
            <CardTitle className="text-lg">Gestionar Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Crear, editar y seguir el progreso de las tareas del equipo
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/dashboard/kpis'}>
          <CardHeader className="text-center">
            <Target className="h-8 w-8 mx-auto text-green-600" />
            <CardTitle className="text-lg">Ver KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Monitorear métricas clave y indicadores de rendimiento
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/dashboard/gantt'}>
          <CardHeader className="text-center">
            <Calendar className="h-8 w-8 mx-auto text-orange-600" />
            <CardTitle className="text-lg">Carta Gantt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Planificar y visualizar cronogramas de proyectos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}