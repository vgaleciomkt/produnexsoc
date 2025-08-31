# TeamCollab - Aplicación de Gestión Colaborativa

Una aplicación web moderna para gestión colaborativa de equipos con tareas, KPIs, Carta Gantt y funcionalidades en tiempo real.

## 🚀 Características Principales

### ✨ **Autenticación Personalizada**
- Login con username específico (Arti, Vikio, Vixo, Joaco)
- Contraseña compartida "24042024" 
- Sesiones persistentes con Supabase Auth
- Roles específicos por usuario

### 📋 **Gestión de Tareas**
- CRUD completo de tareas
- Asignación de tareas por usuario
- Seguimiento de progreso (0-100%)
- Estados: Pendiente, En Progreso, Completada, Cancelada
- Filtros avanzados y búsqueda
- Comentarios threaded con menciones
- Adjuntos de archivos (Supabase Storage)
- Exportación a CSV

### 📊 **Dashboard de KPIs**
- KPIs manuales y calculados automáticamente
- Períodos: semanal, mensual, trimestral
- Visualizaciones con Recharts
- Alertas por umbral (<80% objetivo)
- Comparación objetivos vs reales
- Exportación de datos

### 📅 **Carta Gantt Interactiva**
- Integración con FullCalendar
- Vista timeline por recursos (usuarios)
- Drag & drop para cambiar fechas
- Redimensionado para ajustar duración
- Múltiples vistas: mensual, semanal, timeline
- Filtros por usuario y área

### ⚡ **Tiempo Real**
- Actualizaciones automáticas con Supabase Realtime
- Notificaciones de cambios
- Sincronización entre usuarios
- Activity log completo

### 🎨 **Diseño y UX**
- Diseño responsive mobile-first
- UI moderna con Tailwind CSS + shadcn/ui
- Animaciones suaves con Framer Motion
- Modo oscuro toggle
- Navegación intuitiva con sidebar

## 🛠 Stack Tecnológico

- **Frontend**: Next.js 13 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Charts**: Recharts
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

## ⚙️ Configuración Local

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

### 1. Clonar y configurar proyecto

```bash
# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local` basado en `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 3. Configurar Supabase

1. Crear proyecto en Supabase
2. Ejecutar las migraciones en el SQL Editor:
   - `supabase/migrations/01_create_tables.sql`
   - `supabase/migrations/02_create_storage.sql`
3. Ejecutar los datos de prueba:
   - `supabase/seeds/seed_data.sql`
4. Crear usuarios de Auth:
   ```bash
   node scripts/setup-auth.js
   ```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👥 Credenciales de Acceso

### Usuarios del Sistema:
- **Arti** (Contabilidad/Operaciones)
- **Vikio** (Coordinación)  
- **Vixo** (Estrategia/Marketing)
- **Joaco** (Dirección de Arte/Contenido)

### Contraseña compartida: `24042024`

## 🏗 Estructura del Proyecto

```
teamcollab/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard principal
│   ├── tasks/              # Gestión de tareas
│   ├── kpis/              # Dashboard de KPIs
│   ├── gantt/             # Carta Gantt
│   └── settings/          # Configuración
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── layout/           # Layout y navegación
│   └── auth/             # Autenticación
├── lib/                  # Utilidades y configuración
├── supabase/            # Configuración de Supabase
│   ├── migrations/      # Migraciones SQL
│   └── seeds/          # Datos iniciales
└── scripts/            # Scripts de utilidad
```

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas de acceso basadas en roles
- Autenticación segura con Supabase Auth
- Logs de actividad para auditoría

## 📈 Funcionalidades Implementadas

- ✅ Sistema de autenticación personalizado
- ✅ Dashboard principal con métricas
- ✅ Gestión completa de tareas
- ✅ Dashboard de KPIs con gráficos
- ✅ Carta Gantt interactiva
- ✅ Registro de actividad
- ✅ Configuración de usuario
- ✅ Diseño responsive
- ✅ Base de datos con migraciones
- ✅ Sistema de storage para archivos

## 🚀 Deploy

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Backend (Supabase)
1. Ejecutar migraciones en Supabase
2. Ejecutar seeds para datos iniciales
3. Crear usuarios con script de setup

## 🤝 Contribuciones

El proyecto está diseñado para ser modular y extensible. Para agregar nuevas funcionalidades, seguir los patrones establecidos y mantener la estructura de componentes.

---

**TeamCollab** - Gestión colaborativa moderna para equipos productivos 🚀