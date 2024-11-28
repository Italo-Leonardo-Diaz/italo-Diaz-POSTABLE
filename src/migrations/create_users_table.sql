-- Crear el tipo ENUM para 'role'
CREATE TYPE role_enum AS ENUM ('user', 'admin');

-- Crear la tabla users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,  
  username VARCHAR(255) NOT NULL UNIQUE,  
  email VARCHAR(255) NOT NULL UNIQUE,  
  password VARCHAR(60) NOT NULL,  
  role role_enum DEFAULT 'user',  
  is_active BOOLEAN DEFAULT TRUE,  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
  password_reset_token VARCHAR(255), 
  password_reset_expiry TIMESTAMP,  
  CONSTRAINT email_format CHECK (email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),  
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),  
  CONSTRAINT password_strength CHECK (length(password) >= 8 AND 
                                      password ~ '[A-Z]' AND 
                                      password ~ '[a-z]' AND 
                                      password ~ '[0-9]' AND 
                                      password ~ '[^A-Za-z0-9]'),  
  CONSTRAINT unique_email_or_username CHECK (email IS NOT NULL OR username IS NOT NULL),  
  CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))  
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_role ON users(role);

CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = CURRENT_TIMESTAMP;  
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
