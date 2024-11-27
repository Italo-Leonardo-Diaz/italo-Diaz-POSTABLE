-- Crear el tipo ENUM para 'status' en posts
CREATE TYPE post_status_enum AS ENUM ('draft', 'published', 'archived');

-- Crear la tabla posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,  -- Identificador único para cada publicación
  user_id INTEGER NOT NULL,  -- ID del usuario que creó la publicación
  title VARCHAR(255) NOT NULL,  -- Título de la publicación
  content TEXT NOT NULL,  -- Contenido de la publicación
  status post_status_enum DEFAULT 'draft',  -- Estado de la publicación
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de creación
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de última actualización
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Relación con la tabla de usuarios
  CONSTRAINT title_length CHECK (length(title) > 0 AND length(title) <= 255),  -- Validación para asegurar que el título no esté vacío ni sea demasiado largo
  CONSTRAINT title_valid CHECK (title ~ '^[a-zA-Z0-9 ]+$'),  -- Validación para asegurar que el título solo contenga caracteres alfanuméricos y espacios
  CONSTRAINT content_length CHECK (length(content) > 0 AND length(content) <= 5000)  -- Validación para asegurar que el contenido no esté vacío ni sea demasiado largo
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_status ON posts(status);

-- Crear la tabla de logs de errores para mejorar el manejo de excepciones
CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  error_message TEXT,
  error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para sanitizar el contenido antes de insertar o actualizar
CREATE OR REPLACE FUNCTION sanitize_content()
RETURNS TRIGGER AS $$ 
BEGIN 
  BEGIN
    -- Usamos una expresión regular para eliminar etiquetas HTML peligrosas
    NEW.content = REGEXP_REPLACE(NEW.content, '<script[^>]*>.*?</script>', '', 'gi');  -- Eliminar <script>
    NEW.content = REGEXP_REPLACE(NEW.content, '<.*?on[a-z]+=[^>]*>', '', 'gi');  -- Eliminar atributos event handler (onClick, etc.)
    NEW.content = REGEXP_REPLACE(NEW.content, '<[^>]+>', '', 'gi');  -- Eliminar cualquier otra etiqueta HTML peligrosa (opcional y se puede mejorar más)
    
    -- Agregar más reglas de sanitización si es necesario (ej. eliminar otros atributos peligrosos)

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Registrar el error en la tabla de logs
    INSERT INTO error_logs (error_message) VALUES (SQLERRM);
    -- También puedes usar RAISE NOTICE para ver los errores en la consola
    RAISE NOTICE 'Error sanitizing content: %', SQLERRM;
    -- Devolver NULL para evitar la inserción o actualización en caso de error
    RETURN NULL;
  END;
END; 
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función de sanitización antes de insertar o actualizar
CREATE TRIGGER sanitize_post_content
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION sanitize_content();

-- Trigger para actualizar el campo updated_at al modificar la publicación
CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = CURRENT_TIMESTAMP;  -- Actualiza la fecha y hora
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_timestamp
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
