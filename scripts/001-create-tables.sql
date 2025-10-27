-- Create users table to store user information and earnings
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(100),
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create training_submissions table to store corrected translations
CREATE TABLE IF NOT EXISTS training_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  region VARCHAR(100),
  earnings DECIMAL(10, 2) DEFAULT 0.10,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON training_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_region ON training_submissions(region);
