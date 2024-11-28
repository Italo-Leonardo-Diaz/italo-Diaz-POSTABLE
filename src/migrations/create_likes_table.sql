-- Creación de la tabla 'likes'
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,  
  user_id INTEGER NOT NULL,  
  post_id INTEGER NOT NULL,  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,

  CONSTRAINT unique_like UNIQUE (user_id, post_id),  
  
  CONSTRAINT user_exists CHECK (user_id > 0),
  CONSTRAINT post_exists CHECK (post_id > 0)
);

CREATE INDEX IF NOT EXISTS idx_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON likes(created_at);

CREATE INDEX IF NOT EXISTS idx_user_post_created_at ON likes(user_id, post_id, created_at);
