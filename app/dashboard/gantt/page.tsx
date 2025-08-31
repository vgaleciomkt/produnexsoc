'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, type Task, type User } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Users,
  Filter,
  Download,
  Plus
} from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_COLORS = {
  pending: '#F59E0B',
  in_progress: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444'
}

export default function GanttPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('resourceTimelineMonth')
  const [userFilter, setUserFilter] = useState<string>('all')

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
        .select('*')
        .order('start_date', { ascending: true })

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

  const handleEventDrop = async (info: any) => {
    const { event } = info
    const taskId = event.id
    
    try {
      const newStartDate = event.start.toISOString()
      const newEndDate = event.end ? event.end.toISOString() : null

      const { error } = await supabase
        .from('tasks')
        .update({
          start_date: newStartDate,
          due_date: newEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error
      
      // Reload tasks to reflect changes
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert the event if update failed
      info.revert()
    }
  }

  const handleEventResize = async (info: any) => {
    const { event } = info
    const taskId = event.id
    
    try {
      const newEndDate = event.end ? event.end.toISOString() : null

      const { error } = await supabase
        .from('tasks')
        .update({
          due_date: newEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error
      
      // Reload tasks to reflect changes
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert the event if update failed
      info.revert()
    }
  }

  // Prepare calendar data
  const resources = users.map(user => ({
    id: user.id,
    title: user.username,
    extendedProps: {
      role: user.role,
      area: user.area
    }
  }))

  const events = tasks
    .filter(task => {
      if (userFilter === 'all') return true
      return task.assigned_to === userFilter
    })
    .filter(task => task.start_date || task.due_date)
    .map(task => {
      const assignedUser = users.find(u => u.id === task.assigned_to)
      
      return {
        id: task.id,
        resourceId: task.assigned_to,
        title: task.title,
        start: task.start_date,
        end: task.due_date,
        backgroundColor: STATUS_COLORS[task.status],
        borderColor: STATUS_COLORS[task.status],
        extendedProps: {
          description: task.description,
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          area: task.area,
          assignedUser: assignedUser?.username
        }
      }
    })

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-96 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carta Gantt</h1>
          <p className="text-muted-foreground">
            Planifica y visualiza el cronograma de proyectos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resourceTimelineMonth">Timeline Mensual</SelectItem>
              <SelectItem value="resourceTimelineWeek">Timeline Semanal</SelectItem>
              <SelectItem value="dayGridMonth">Mes</SelectItem>
              <SelectItem value="timeGridWeek">Semana</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
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
        </div>

        {/* Legend */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>En Progreso</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Completada</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Cancelada</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div style={{ minHeight: '600px' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, resourceTimelinePlugin, interactionPlugin]}
              initialView={view}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'resourceTimelineMonth,resourceTimelineWeek,dayGridMonth,timeGridWeek'
              }}
              resources={view.includes('resource') ? resources : undefined}
              events={events}
              editable={true}
              droppable={true}
              eventResizableFromStart={true}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              height="600px"
              locale="es"
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              resourceAreaHeaderContent="Equipo"
              resourceAreaWidth="200px"
              eventContent={(eventInfo) => {
                const { event } = eventInfo
                const { extendedProps } = event
                
                return (
                  <div className="p-1 text-xs">
                    <div className="font-semibold truncate">
                      {event.title}
                    </div>
                    {extendedProps.assignedUser && (
                      <div className="opacity-75">
                        {extendedProps.assignedUser}
                      </div>
                    )}
                    {extendedProps.progress !== undefined && (
                      <div className="opacity-75">
                        {extendedProps.progress}%
                      </div>
                    )}
                  </div>
                )
              }}
              eventDidMount={(info) => {
                // Add tooltips with more information
                const { event } = info
                const { extendedProps } = event
                
                info.el.title = [
                  event.title,
                  extendedProps.description,
                  `Estado: ${extendedProps.status}`,
                  `Prioridad: ${extendedProps.priority}`,
                  `Progreso: ${extendedProps.progress}%`,
                  `Área: ${extendedProps.area}`
                ].filter(Boolean).join('\n')
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => 
                t.due_date && 
                new Date(t.due_date) < new Date() && 
                t.status !== 'completed'
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}