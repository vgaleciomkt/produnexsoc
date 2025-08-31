'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  BarChart3, 
  CheckSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Home,
  Target,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tareas', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'KPIs', href: '/dashboard/kpis', icon: Target },
  { name: 'Gantt', href: '/dashboard/gantt', icon: Calendar },
  { name: 'Actividad', href: '/dashboard/activity', icon: Activity },
]

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-6 border-b">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">TeamCollab</h1>
          <p className="text-xs text-muted-foreground">Gestión Colaborativa</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar_url} alt={user?.username} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {user?.username?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.area}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Button
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            asChild
          >
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4 mr-3" />
              Configuración
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      <div className={cn(
        'lg:hidden fixed inset-0 z-40 flex',
        isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}>
        <div className={cn(
          'fixed inset-0 bg-gray-600/75 transition-opacity duration-300',
          isMobileOpen ? 'opacity-100' : 'opacity-0'
        )} onClick={() => setIsMobileOpen(false)} />
        
        <div className={cn(
          'relative flex-1 flex flex-col max-w-xs w-full bg-white transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r">
        <SidebarContent />
      </div>
    </>
  )
}