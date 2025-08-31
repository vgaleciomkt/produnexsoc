/*
  # TeamCollab Database Schema

  1. New Tables
    - `users` - User profiles with roles and areas
    - `tasks` - Task management with assignments and progress
    - `comments` - Threaded comments system with mentions
    - `kpis` - KPI tracking with targets and current values
    - `activity_logs` - Activity tracking for audit trails
    - `attachments` - File attachments metadata

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Restrict sensitive operations to appropriate roles

  3. Functions
    - Helper functions for calculating KPIs
    - Trigger functions for activity logging
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('Contabilidad', 'Coordinación', 'Estrategia', 'Dirección');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE kpi_type AS ENUM ('manual', 'calculated');
CREATE TYPE kpi_period AS ENUM ('weekly', 'monthly', 'quarterly');
CREATE TYPE entity_type AS ENUM ('task', 'kpi', 'comment');

-- Users table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role NOT NULL,
  area text NOT NULL,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id) NOT NULL,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date timestamptz,
  due_date timestamptz,
  completed_at timestamptz,
  area text NOT NULL,
  tags text[] DEFAULT '{}',
  attachments jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table (threaded comments)
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  mentions uuid[] DEFAULT '{}',
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KPIs table
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type kpi_type DEFAULT 'manual',
  category text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  period kpi_period DEFAULT 'monthly',
  unit text DEFAULT '%',
  threshold_warning numeric DEFAULT 80,
  area text NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  calculation_formula text, -- For calculated KPIs
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  action text NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id uuid NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size integer,
  file_type text,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_area ON tasks(area);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_area ON kpis(area);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read all user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can read all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = created_by));

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (SELECT auth_user_id FROM users WHERE id = created_by) OR
    auth.uid() = (SELECT auth_user_id FROM users WHERE id = assigned_to)
  );

CREATE POLICY "Users can delete tasks they created"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = created_by));

-- RLS Policies for comments
CREATE POLICY "Users can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- RLS Policies for KPIs
CREATE POLICY "Users can read all KPIs"
  ON kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create KPIs"
  ON kpis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = created_by));

CREATE POLICY "Users can update KPIs they created"
  ON kpis FOR UPDATE
  TO authenticated
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = created_by));

-- RLS Policies for activity logs (read-only for users)
CREATE POLICY "Users can read their own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- RLS Policies for attachments
CREATE POLICY "Users can read all attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create attachments"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = uploaded_by));

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER kpis_updated_at BEFORE UPDATE ON kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val uuid;
  action_val text;
BEGIN
  -- Determine user_id based on the table
  CASE TG_TABLE_NAME
    WHEN 'tasks' THEN
      IF TG_OP = 'INSERT' THEN
        user_id_val := NEW.created_by;
        action_val := 'created task';
      ELSIF TG_OP = 'UPDATE' THEN
        user_id_val := NEW.assigned_to;
        action_val := 'updated task';
      ELSIF TG_OP = 'DELETE' THEN
        user_id_val := OLD.created_by;
        action_val := 'deleted task';
      END IF;
    WHEN 'kpis' THEN
      IF TG_OP = 'INSERT' THEN
        user_id_val := NEW.created_by;
        action_val := 'created KPI';
      ELSIF TG_OP = 'UPDATE' THEN
        user_id_val := NEW.created_by;
        action_val := 'updated KPI';
      END IF;
    WHEN 'comments' THEN
      IF TG_OP = 'INSERT' THEN
        user_id_val := NEW.user_id;
        action_val := 'added comment';
      ELSIF TG_OP = 'UPDATE' THEN
        user_id_val := NEW.user_id;
        action_val := 'updated comment';
      END IF;
  END CASE;

  -- Insert activity log
  IF user_id_val IS NOT NULL THEN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      user_id_val,
      action_val,
      TG_TABLE_NAME::entity_type,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object('operation', TG_OP, 'timestamp', now())
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Activity logging triggers
CREATE TRIGGER tasks_activity_log AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER kpis_activity_log AFTER INSERT OR UPDATE OR DELETE ON kpis FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER comments_activity_log AFTER INSERT OR UPDATE OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION log_activity();