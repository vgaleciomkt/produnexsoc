/*
  # Seed Data for TeamCollab

  1. Users
    - Create the 4 main users with their roles and areas
    - Set up user preferences

  2. Sample Tasks
    - Create sample tasks for demonstration
    - Assign tasks to different users

  3. Sample KPIs
    - Create KPIs for different areas
    - Set targets and current values

  4. Sample Comments
    - Add some comments to tasks for testing
*/

-- Insert users (these correspond to Auth users that need to be created separately)
INSERT INTO users (id, username, role, area, preferences) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Arti', 'Contabilidad', 'Contabilidad/Operaciones', '{"theme": "light", "notifications": true}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Vikio', 'Coordinación', 'Coordinación', '{"theme": "dark", "notifications": true}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Vixo', 'Estrategia', 'Estrategia/Marketing', '{"theme": "system", "notifications": true}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Joaco', 'Dirección', 'Dirección de Arte/Contenido', '{"theme": "dark", "notifications": false}')
ON CONFLICT (username) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, title, description, assigned_to, created_by, status, priority, progress, start_date, due_date, area, tags) VALUES
  (gen_random_uuid(), 'Revisar estados financieros Q4', 'Análisis completo de los estados financieros del cuarto trimestre', 
   '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'in_progress', 'high', 60, 
   now() - interval '3 days', now() + interval '4 days', 'Contabilidad/Operaciones', ARRAY['finanzas', 'Q4']),
   
  (gen_random_uuid(), 'Campaña de marketing digital', 'Diseñar y ejecutar campaña para el lanzamiento del nuevo producto', 
   '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'pending', 'medium', 0, 
   now() + interval '1 day', now() + interval '14 days', 'Estrategia/Marketing', ARRAY['marketing', 'digital', 'producto']),
   
  (gen_random_uuid(), 'Actualizar identidad visual', 'Renovar logotipo y elementos gráficos de la marca', 
   '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'in_progress', 'medium', 30, 
   now() - interval '1 day', now() + interval '10 days', 'Dirección de Arte/Contenido', ARRAY['diseño', 'branding']),
   
  (gen_random_uuid(), 'Coordinación reunión semanal', 'Organizar y facilitar la reunión semanal del equipo', 
   '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'completed', 'low', 100, 
   now() - interval '7 days', now() - interval '6 days', 'Coordinación', ARRAY['reunión', 'equipo']),
   
  (gen_random_uuid(), 'Análisis de competencia', 'Estudio detallado de los principales competidores del mercado', 
   '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'pending', 'high', 0, 
   now() + interval '2 days', now() + interval '21 days', 'Estrategia/Marketing', ARRAY['análisis', 'competencia']);

-- Insert sample KPIs
INSERT INTO kpis (id, name, description, type, category, target_value, current_value, period, unit, threshold_warning, area, created_by) VALUES
  (gen_random_uuid(), 'Tareas completadas a tiempo', 'Porcentaje de tareas completadas dentro del plazo establecido', 'calculated', 'Productividad', 90, 75, 'monthly', '%', 80, 'Coordinación', '550e8400-e29b-41d4-a716-446655440002'),
  
  (gen_random_uuid(), 'ROI Campañas Marketing', 'Retorno de inversión de las campañas de marketing digital', 'manual', 'Marketing', 250, 180, 'quarterly', '%', 200, 'Estrategia/Marketing', '550e8400-e29b-41d4-a716-446655440003'),
  
  (gen_random_uuid(), 'Satisfacción Cliente', 'Índice de satisfacción de clientes basado en encuestas', 'manual', 'Calidad', 4.5, 4.2, 'monthly', 'puntos', 4.0, 'Dirección de Arte/Contenido', '550e8400-e29b-41d4-a716-446655440004'),
  
  (gen_random_uuid(), 'Costos Operacionales', 'Control de costos operacionales mensuales', 'manual', 'Finanzas', 50000, 48500, 'monthly', '$', 52000, 'Contabilidad/Operaciones', '550e8400-e29b-41d4-a716-446655440001'),
  
  (gen_random_uuid(), 'Leads Generados', 'Número de leads generados por actividades de marketing', 'calculated', 'Marketing', 150, 130, 'monthly', 'cantidad', 120, 'Estrategia/Marketing', '550e8400-e29b-41d4-a716-446655440003'),
  
  (gen_random_uuid(), 'Tiempo Promedio Respuesta', 'Tiempo promedio de respuesta a consultas de clientes', 'calculated', 'Servicio', 24, 18, 'weekly', 'horas', 30, 'Coordinación', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample comments
WITH sample_task AS (
  SELECT id FROM tasks WHERE title = 'Revisar estados financieros Q4' LIMIT 1
)
INSERT INTO comments (task_id, user_id, content) 
SELECT sample_task.id, '550e8400-e29b-41d4-a716-446655440002', 'He revisado los documentos iniciales. Necesitamos los balances del mes pasado para continuar.'
FROM sample_task;

WITH sample_task AS (
  SELECT id FROM tasks WHERE title = 'Actualizar identidad visual' LIMIT 1
)
INSERT INTO comments (task_id, user_id, content)
SELECT sample_task.id, '550e8400-e29b-41d4-a716-446655440004', 'Tengo algunas propuestas de diseño listas. ¿Podemos programar una reunión para revisarlas?'
FROM sample_task;

-- Insert activity logs for demonstration
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
SELECT '550e8400-e29b-41d4-a716-446655440002', 'created task', 'task', t.id, '{"operation": "INSERT", "timestamp": "' || now() || '"}'
FROM tasks t 
WHERE t.created_by = '550e8400-e29b-41d4-a716-446655440002'
LIMIT 3;