-- Crear el tipo ENUM para 'role'
CREATE TYPE role_enum AS ENUM ('user', 'admin');

-- Crear la tabla users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,  -- Identificador único para cada usuario
  username VARCHAR(255) NOT NULL UNIQUE,  -- Nombre de usuario único y no nulo
  email VARCHAR(255) NOT NULL UNIQUE,  -- Correo electrónico único y no nulo
  password VARCHAR(60) NOT NULL,  -- Contraseña encriptada, longitud adecuada para bcrypt
  role role_enum DEFAULT 'user',  -- Rol del usuario, por defecto 'user'
  is_active BOOLEAN DEFAULT TRUE,  -- Estado activo/inactivo del usuario
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de creación
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de última actualización
  password_reset_token VARCHAR(255),  -- Token para restablecimiento de contraseña (si es necesario)
  password_reset_expiry TIMESTAMP,  -- Fecha de expiración del token de restablecimiento de contraseña
  CONSTRAINT email_format CHECK (email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),  -- Validación básica del formato de correo electrónico
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),  -- Validación de nombre de usuario (alfanumérico + guion bajo)
  CONSTRAINT password_strength CHECK (length(password) >= 8 AND 
                                      password ~ '[A-Z]' AND 
                                      password ~ '[a-z]' AND 
                                      password ~ '[0-9]' AND 
                                      password ~ '[^A-Za-z0-9]'),  -- Validación de fortaleza de contraseña: mínimo 8 caracteres, debe tener mayúsculas, minúsculas, números y caracteres especiales
  CONSTRAINT unique_email_or_username CHECK (email IS NOT NULL OR username IS NOT NULL),  -- Validación para asegurar que al menos uno de los dos (email o username) esté presente
  CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))  -- Validación del rol
);

-- Crear índice en email para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_email ON users(email);

-- Crear índice en username para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_username ON users(username);

-- Crear índice en created_at para ordenar o filtrar usuarios por fecha de creación
CREATE INDEX IF NOT EXISTS idx_created_at ON users(created_at);

-- Crear un índice en is_active para consultas sobre usuarios activos o inactivos
CREATE INDEX IF NOT EXISTS idx_is_active ON users(is_active);

-- Agregar un índice en el rol para consultas frecuentes por rol
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- Trigger para actualizar el campo updated_at al modificar el usuario
CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = CURRENT_TIMESTAMP;  -- Actualiza la fecha y hora
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
