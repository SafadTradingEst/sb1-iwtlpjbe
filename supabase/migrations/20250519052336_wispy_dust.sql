/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - username (text, unique)
      - password (text)
      - name (text)
      - role (text)
      - department (text)
      - avatar_url (text)
      - created_at (timestamp)

    - records
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - description (text)
      - project_name (text)
      - file_urls (jsonb)
      - department (text)
      - created_at (timestamp)
      - start_time (text)
      - end_time (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'employee',
  department text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create records table
CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  description text NOT NULL,
  project_name text NOT NULL,
  file_urls jsonb DEFAULT '[]',
  department text NOT NULL,
  created_at timestamptz DEFAULT now(),
  start_time text NOT NULL,
  end_time text NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for records table
CREATE POLICY "Users can read their own records"
  ON records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create their own records"
  ON records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial admin user (SAFAD)
INSERT INTO users (id, username, password, name, role, avatar_url)
VALUES (
  gen_random_uuid(),
  'SAFAD',
  'SAFAD',
  'SAFAD',
  'admin',
  'SAFAD'
) ON CONFLICT (username) DO NOTHING;