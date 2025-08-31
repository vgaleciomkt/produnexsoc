'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Database,
  Download
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil y preferencias del sistema
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Profile */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar_url} alt={user?.username} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {user?.username?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{user?.username}</h3>
                <div className="space-y-1">
                  <Badge variant="outline">{user?.role}</Badge>
                  <p className="text-sm text-muted-foreground">{user?.area}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Información del Sistema</Label>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p>ID: {user?.id?.substring(0, 8)}...</p>
                  <p>Miembro desde: Enero 2024</p>
                  <p>Última actividad: Hace 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo quieres recibir las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tiempo real
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-digest">Resumen por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe un resumen semanal por email
                  </p>
                </div>
                <Switch
                  id="email-digest"
                  checked={emailDigest}
                  onCheckedChange={setEmailDigest}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Modo oscuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Cambia a una interfaz con tema oscuro
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de seguridad y acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start">
                  Cambiar contraseña
                </Button>
                <Button variant="outline" className="justify-start">
                  Activar autenticación de dos factores
                </Button>
                <Button variant="outline" className="justify-start">
                  Ver sesiones activas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Datos y Exportación
              </CardTitle>
              <CardDescription>
                Gestiona tus datos y exportaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Exportar mis tareas
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Exportar datos de KPIs
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Descargar registro de actividad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button variant="outline">Cancelar</Button>
        <Button>Guardar cambios</Button>
      </div>
    </div>
  )
}