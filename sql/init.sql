-- starts docker service and you can see all the tables in postgres database.
-- docker-compose ps
-- docker exec -it activity-feed-postgres-1 psql -U feeduser -d activityfeed
-- \dt

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);

CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES users(id),
  following_id UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following_id ON follows(following_id);

CREATE TABLE likes (
  user_id    UUID NOT NULL REFERENCES users(id),
  post_id    UUID NOT NULL REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

