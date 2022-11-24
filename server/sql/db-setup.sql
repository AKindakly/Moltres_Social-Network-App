DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS passwordCodes;
DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS posts;



CREATE TABLE users (
    id SERIAL primary key,
    first_name VARCHAR(255) NOT NULL CHECK(first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK(last_name != ''),
    email VARCHAR(255) NOT NULL UNIQUE CHECK(email != ''),
    password VARCHAR(255) NOT NULL CHECK(password != ''),
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN bio TEXT;

CREATE TABLE passwordCodes (
    email VARCHAR(255) NOT NULL REFERENCES users(email),
    passwordCode VARCHAR(255) NOT NULL CHECK(passwordCode != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL CHECK (message != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE posts (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id) NOT NULL,
--     post TEXT NOT NULL CHECK (message != ''),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );