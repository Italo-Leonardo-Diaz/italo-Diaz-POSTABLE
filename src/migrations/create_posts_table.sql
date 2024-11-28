-- Crear el tipo ENUM para 'status' en posts
CREATE TYPE post_status_enum AS ENUM ('draft', 'published', 'archived');

-- Crear la tabla posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,  
  user_id INTEGER NOT NULL,  
  title VARCHAR(255) NOT NULL,  
  content TEXT NOT NULL,  
  status post_status_enum DEFAULT 'draft', 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  
  CONSTRAINT title_length CHECK (length(title) > 0 AND length(title) <= 255),  
  CONSTRAINT title_valid CHECK (title ~ '^[a-zA-Z0-9 ]+$'),  
  CONSTRAINT content_length CHECK (length(content) > 0 AND length(content) <= 5000)  
);

CREATE INDEX IF NOT EXISTS idx_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_status ON posts(status);

CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  error_message TEXT,
  error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION sanitize_content()
RETURNS TRIGGER AS $$ 
BEGIN 
  BEGIN
    NEW.content = REGEXP_REPLACE(NEW.content, '<script[^>]*>.*?</script>', '', 'gi');  
    NEW.content = REGEXP_REPLACE(NEW.content, '<.*?on[a-z]+=[^>]*>', '', 'gi');  
    NEW.content = REGEXP_REPLACE(NEW.content, '<[^>]+>', '', 'gi'); 
    

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO error_logs (error_message) VALUES (SQLERRM);
    RAISE NOTICE 'Error sanitizing content: %', SQLERRM;
    RETURN NULL;
  END;
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_post_content
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION sanitize_content();

CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = CURRENT_TIMESTAMP;  
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_timestamp
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
