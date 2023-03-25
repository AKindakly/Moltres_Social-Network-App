DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS passwordCodes;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS messages;


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

INSERT INTO users (first_name, last_name, email, password, profile_pic, bio) VALUES 

('Fernando', 'Rickard', 'juniper0@example.com', '$2a$10$rgkdge0a6V2S6Jqwa7cqQuSpzkiWEvuI2UYaqwl50oGGKFz/15gF.', 'https://randomuser.me/api/portraits/men/35.jpg', 'Step-Brother. Brother. Certified Public Accountant. Visualize world peace.'),
('Kaine', 'Pratt', 'juniper1@example.com', '$2a$10$rgkdge0a6V2S6Jqwa7cqQuSpzkiWEvuI2UYaqwl50oGGKFz/15gF.', 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTc2MTM2MjQ3OF5BMl5BanBnXkFtZTcwNDU4NDIxOQ@@._V1_UX172_CR0,0,172,256_AL_.jpg', 'Father-in-Law. Uncle. Entrepreneur. I feel the need for speed.'),
('Dana', 'Miller', 'juniper2@example.com', '$2a$10$rgkdge0a6V2S6Jqwa7cqQuSpzkiWEvuI2UYaqwl50oGGKFz/15gF.', 'https://images.pexels.com/photos/594421/pexels-photo-594421.jpeg?h=350&auto=compress&cs=tinysrgb', 'Niece. Great-Granddaughter. Friend to all cats. I am the master of my destiny. I am the captain of my soul.');

