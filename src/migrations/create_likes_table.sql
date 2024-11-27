-- Creación de la tabla 'likes'
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,  -- Identificador único para cada like
  user_id INTEGER NOT NULL,  -- ID del usuario que dio el like
  post_id INTEGER NOT NULL,  -- ID de la publicación a la que se le dio el like
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de la creación del like
  
  -- Relación con la tabla de usuarios
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Relación con la tabla de publicaciones
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,

  -- Un usuario no puede dar like a la misma publicación más de una vez
  CONSTRAINT unique_like UNIQUE (user_id, post_id),  
  
  -- Verificación de que 'user_id' y 'post_id' son positivos
  CONSTRAINT user_exists CHECK (user_id > 0),
  CONSTRAINT post_exists CHECK (post_id > 0)
);

-- Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON likes(created_at);

-- Índice compuesto para mejorar las consultas por 'user_id', 'post_id' y 'created_at'
CREATE INDEX IF NOT EXISTS idx_user_post_created_at ON likes(user_id, post_id, created_at);
