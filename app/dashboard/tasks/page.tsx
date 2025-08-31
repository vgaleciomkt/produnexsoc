'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, type Task, type User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignedFilter, setAssignedFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadTasks()
      loadUsers()
    }
  }, [user])

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_to(username),
          creator:created_by(username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesAssigned = assignedFilter === 'all' || task.assigned_to === assignedFilter
    
    return matchesSearch && matchesStatus && matchesAssigned
  })

  const isOverdue = (task: Task) => {
    return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-32" />
          ))}
        </div>
        <div className="grid gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
          <p className="text-muted-foreground">
            Organiza y hace seguimiento de las tareas del equipo
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Asignado a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron tareas</p>
              <p className="text-sm">Intenta ajustar los filtros o crear una nueva tarea</p>
            </div>
          </Card>
        ) : (
          filteredTasks.map(task => {
            const StatusIcon = STATUS_CONFIG[task.status].icon
            const isTaskOverdue = isOverdue(task)
            
            return (
              <Card key={task.id} className={`hover:shadow-md transition-shadow ${isTaskOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg leading-tight">
                            {task.title}
                            {isTaskOverdue && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Vencida
                              </Badge>
                            )}
                          </h3>
                          {task.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={STATUS_CONFIG[task.status].color}>
                            {STATUS_CONFIG[task.status].label}
                          </Badge>
                        </div>

                        <Badge className={PRIORITY_CONFIG[task.priority].color}>
                          {PRIORITY_CONFIG[task.priority].label}
                        </Badge>

                        {task.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {users.find(u => u.id === task.assigned_to)?.username || 'Usuario'}
                            </span>
                          </div>
                        )}

                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className={isTaskOverdue ? 'text-red-600 font-medium' : ''}>
                              {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                        )}

                        <div className="text-xs">
                          Área: {task.area}
                        </div>
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <span>
          Mostrando {filteredTasks.length} de {tasks.length} tareas
        </span>
        <div className="flex gap-4">
          <span>Completadas: {tasks.filter(t => t.status === 'completed').length}</span>
          <span>En progreso: {tasks.filter(t => t.status === 'in_progress').length}</span>
          <span>Pendientes: {tasks.filter(t => t.status === 'pending').length}</span>
        </div>
      </div>
    </div>
  )
}