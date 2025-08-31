'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, type ActivityLog, type User } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity,
  CheckSquare,
  Target,
  MessageSquare,
  Calendar,
  User,
  Filter
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const ACTION_CONFIG = {
  'created task': { 
    label: 'creó una tarea', 
    icon: CheckSquare, 
    color: 'bg-green-100 text-green-800' 
  },
  'updated task': { 
    label: 'actualizó una tarea', 
    icon: CheckSquare, 
    color: 'bg-blue-100 text-blue-800' 
  },
  'deleted task': { 
    label: 'eliminó una tarea', 
    icon: CheckSquare, 
    color: 'bg-red-100 text-red-800' 
  },
  'created KPI': { 
    label: 'creó un KPI', 
    icon: Target, 
    color: 'bg-purple-100 text-purple-800' 
  },
  'updated KPI': { 
    label: 'actualizó un KPI', 
    icon: Target, 
    color: 'bg-purple-100 text-purple-800' 
  },
  'added comment': { 
    label: 'agregó un comentario', 
    icon: MessageSquare, 
    color: 'bg-orange-100 text-orange-800' 
  },
  'updated comment': { 
    label: 'actualizó un comentario', 
    icon: MessageSquare, 
    color: 'bg-orange-100 text-orange-800' 
  }
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<(ActivityLog & { user: User })[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadActivity()
      loadUsers()
    }
  }, [user])

  const loadActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activity:', error)
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

  const filteredActivities = activities.filter(activity => {
    const matchesUser = userFilter === 'all' || activity.user_id === userFilter
    const matchesAction = actionFilter === 'all' || activity.action === actionFilter
    return matchesUser && matchesAction
  })

  const getUniqueActions = () => {
    return [...new Set(activities.map(activity => activity.action))]
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-32" />
          ))}
        </div>
        <div className="space-y-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
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
          <h1 className="text-2xl font-bold text-gray-900">Registro de Actividad</h1>
          <p className="text-muted-foreground">
            Historial de acciones y cambios en el sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredActivities.length} actividades
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los usuarios</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            {getUniqueActions().map(action => (
              <SelectItem key={action} value={action}>
                {ACTION_CONFIG[action as keyof typeof ACTION_CONFIG]?.label || action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay actividad para mostrar</p>
              <p className="text-sm">Intenta ajustar los filtros</p>
            </div>
          </Card>
        ) : (
          filteredActivities.map(activity => {
            const actionConfig = ACTION_CONFIG[activity.action as keyof typeof ACTION_CONFIG]
            const ActionIcon = actionConfig?.icon || Activity
            
            return (
              <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={activity.user?.avatar_url} alt={activity.user?.username} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {activity.user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {activity.user?.username || 'Usuario'}
                        </span>
                        <span className="text-muted-foreground">
                          {actionConfig?.label || activity.action}
                        </span>
                        {actionConfig && (
                          <Badge className={actionConfig.color}>
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {activity.entity_type}
                          </Badge>
                        )}
                      </div>

                      {/* Additional Details */}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {activity.details.operation && (
                            <span>Operación: {activity.details.operation}</span>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(activity.created_at), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </span>
                        </div>
                        <span>
                          {format(new Date(activity.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Load More */}
      {activities.length >= 100 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Mostrando las últimas 100 actividades
          </p>
        </div>
      )}
    </div>
  )
}