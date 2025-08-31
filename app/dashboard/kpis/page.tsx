'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, type KPI } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const PERIOD_LABELS = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral'
}

export default function KPIsPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadKPIs()
    }
  }, [user])

  const loadKPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKpis(data || [])
    } catch (error) {
      console.error('Error loading KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredKPIs = kpis.filter(kpi => {
    const matchesCategory = categoryFilter === 'all' || kpi.category === categoryFilter
    const matchesPeriod = periodFilter === 'all' || kpi.period === periodFilter
    return matchesCategory && matchesPeriod
  })

  const getPerformancePercentage = (kpi: KPI) => {
    return Math.round((kpi.current_value / kpi.target_value) * 100)
  }

  const getPerformanceStatus = (kpi: KPI) => {
    const percentage = getPerformancePercentage(kpi)
    if (percentage >= kpi.threshold_warning) return 'good'
    if (percentage >= 60) return 'warning'
    return 'danger'
  }

  const getUniqueCategories = () => {
    return [...new Set(kpis.map(kpi => kpi.category))]
  }

  // Prepare chart data
  const chartData = filteredKPIs.map(kpi => ({
    name: kpi.name.length > 15 ? kpi.name.substring(0, 15) + '...' : kpi.name,
    current: kpi.current_value,
    target: kpi.target_value,
    percentage: getPerformancePercentage(kpi)
  }))

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-32" />
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
          <h1 className="text-2xl font-bold text-gray-900">KPIs Dashboard</h1>
          <p className="text-muted-foreground">
            Monitorea los indicadores clave de rendimiento
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo KPI
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {getUniqueCategories().map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los períodos</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensual</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento vs Objetivos</CardTitle>
            <CardDescription>
              Comparación de valores actuales con objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#3B82F6" name="Actual" />
                <Bar dataKey="target" fill="#10B981" name="Objetivo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Porcentaje de Cumplimiento</CardTitle>
            <CardDescription>
              Porcentaje de logro respecto a objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 150]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
                <Line type="monotone" dataKey="percentage" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredKPIs.map(kpi => {
          const percentage = getPerformancePercentage(kpi)
          const status = getPerformanceStatus(kpi)
          
          return (
            <Card key={kpi.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{kpi.name}</CardTitle>
                    {kpi.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {kpi.description}
                      </CardDescription>
                    )}
                  </div>
                  {status === 'danger' && (
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Value Display */}
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold">
                    {kpi.current_value.toLocaleString()} {kpi.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Objetivo: {kpi.target_value.toLocaleString()} {kpi.unit}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span className={`font-medium ${
                      status === 'good' ? 'text-green-600' :
                      status === 'warning' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-3 ${
                      status === 'good' ? 'text-green-600' :
                      status === 'warning' ? 'text-orange-600' : 'text-red-600'
                    }`}
                  />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {PERIOD_LABELS[kpi.period]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {percentage >= kpi.threshold_warning ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    {kpi.category}
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Área: {kpi.area}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredKPIs.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No se encontraron KPIs</p>
            <p className="text-sm">Intenta ajustar los filtros o crear un nuevo KPI</p>
          </div>
        </Card>
      )}

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <span>
          Mostrando {filteredKPIs.length} de {kpis.length} KPIs
        </span>
        <div className="flex gap-4">
          <span className="text-green-600">
            En objetivo: {kpis.filter(k => getPerformanceStatus(k) === 'good').length}
          </span>
          <span className="text-orange-600">
            En alerta: {kpis.filter(k => getPerformanceStatus(k) === 'warning').length}
          </span>
          <span className="text-red-600">
            Críticos: {kpis.filter(k => getPerformanceStatus(k) === 'danger').length}
          </span>
        </div>
      </div>
    </div>
  )
}