require("dotenv").config();
const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost/snetwork"
);

// bcryptjs magic
const bcrypt = require("bcryptjs");

module.exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

module.exports.authenticate = function (email, password) {
    return this.findUserByEmail(email).then((result) => {
        // first find user by email
        // then  check hashed password
        return bcrypt
            .compare(password, result.rows[0].password)
            .then((success) => {
                return success;
            });
    });
};

module.exports.insertUser = function (first_name, last_name, email, password) {
    const sql = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    return this.hash(password).then((hpassword) => {
        return db
            .query(sql, [first_name, last_name, email, hpassword])
            .then((result) => result.rows);
    });
};

module.exports.checkEmail = function (email) {
    const sql = `
        SELECT email FROM users WHERE email = $1;
    `;
    // if rows > 0 => email already exist
    return db.query(sql, [email]).then((result) => result.rows);
};

module.exports.findUserByEmail = function (email) {
    const sql = `SELECT id, email, password FROM users WHERE email = $1;`;
    return db.query(sql, [email]);
};

module.exports.insertPasswordCode = function (email, passwordCode) {
    const sql = `
        INSERT INTO passwordCodes (email, passwordCode)
        VALUES ($1, $2)
        RETURNING *;
    `;
    return db.query(sql, [email, passwordCode]);
};

module.exports.findPasswordCode = function (email) {
    // dont forget to INTERVAL
    // also ORDER to get the last one
    // LIMIT to get only 1 result
    const sql = `
        SELECT passwordCode FROM passwordCodes
        WHERE email = $1 
        AND CURRENT_TIMESTAMP - created_at < INTERVAL '20 minutes'
        ORDER BY created_at DESC
        LIMIT 1;
    `;
    return db.query(sql, [email]);
};

module.exports.insertNewPassword = function (email, password) {
    const sql = `
        UPDATE users SET password = $2
        WHERE email = $1;
    `;
    return this.hash(password).then((hpassword) => {
        return db.query(sql, [email, hpassword]);
    });
};

module.exports.findUserById = function (userId) {
    const sql = `
        SELECT first_name, last_name, CONCAT (first_name, ' ', last_name) AS full_name, profile_pic, bio 
        FROM users WHERE id = $1;
    `;
    return db.query(sql, [userId]);
};

module.exports.insertProfilePic = function (profilePic, userId) {
    const sql = `
        UPDATE users SET profile_pic = $1
        WHERE id = $2
        RETURNING *;
    `;
    return db.query(sql, [profilePic, userId]);
};

module.exports.insertBio = function (bio, userId) {
    const sql = `
        UPDATE users SET bio = $1
        WHERE id = $2
        RETURNING *;
    `;
    return db.query(sql, [bio, userId]);
};

module.exports.findUsersByValue = function (val) {
    const sql = `
        SELECT id, first_name, last_name, CONCAT (first_name, ' ', last_name) AS full_name, profile_pic FROM users
        WHERE first_name ILIKE $1 OR last_name ILIKE $1
        LIMIT 5;
    `;
    return db.query(sql, [val + "%"]);
};

module.exports.findFriendship = (user1, user2) => {
    const sql = `
        SELECT * FROM friendships
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)`;
    return db.query(sql, [user1, user2]);
};

module.exports.insertFriendship = (userId1, userId2) => {
    const sql = `
        INSERT INTO friendships (sender_id, recipient_id)
        VALUES ($1, $2)
        RETURNING *;
        `;
    return db.query(sql, [userId1, userId2]);
};

module.exports.deleteFriendship = (userId1, userId2) => {
    const sql = `
        DELETE FROM friendships 
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)
        `;
    return db.query(sql, [userId1, userId2]);
};

module.exports.acceptFriendship = (userId1, userId2) => {
    const sql = `
        UPDATE friendships SET accepted = true
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)
        `;
    return db.query(sql, [userId1, userId2]);
};

module.exports.retrievingFriends = (userId) => {
    const sql = `
    
        SELECT users.id, first_name, last_name, CONCAT (first_name, ' ', last_name) AS full_name, accepted, profile_pic FROM users
        JOIN friendships
        ON (accepted = true AND recipient_id = $1 AND users.id = friendships.sender_id)
        OR (accepted = true AND sender_id = $1 AND users.id = friendships.recipient_id)
        OR (accepted = false AND recipient_id = $1 AND users.id = friendships.sender_id)
        ORDER BY first_name ASC;
 `;
    return db.query(sql, [userId]);
};

module.exports.getLastMessages = (limit = 10) => {
    const sql = `
        SELECT messages.id, first_name, last_name, CONCAT (first_name, ' ', last_name) AS full_name, profile_pic, user_id, message, 
        TO_CHAR(messages.created_at, 'DD/MM/YYYY, HH24:MI:SS') AS create_at
        FROM users
        JOIN messages
        ON messages.user_id = users.id
        ORDER BY messages.created_at DESC
        LIMIT $1;
        `;
    return db.query(sql, [limit]);
};

function getLastMessageById(messageId) {
    const sql = `
        SELECT messages.id, first_name, last_name, CONCAT (first_name, ' ', last_name) AS full_name, profile_pic, user_id, message, 
        TO_CHAR(messages.created_at, 'DD/MM/YYYY, HH24:MI:SS') AS create_at
        FROM users
        JOIN messages
        ON messages.user_id = users.id
        WHERE messages.id = $1;
        `;
    return db.query(sql, [messageId]);
}

module.exports.insertMessage = (userId, message) => {
    const sql = `
        INSERT INTO messages (user_id, message)
        VALUES ($1, $2)
        RETURNING *;
        `;
    return db.query(sql, [userId, message]).then((result) => {
        const messageId = result.rows[0].id;
        return getLastMessageById(messageId).then((data) => data.rows[0]);
    });
};

module.exports.getHowManyFriends = (userId) => {
    const sql = `
        SELECT count(CASE WHEN accepted THEN 1 END) 
        FROM friendships
        WHERE sender_id = $1 or recipient_id = $1;
        `;
    return db.query(sql, [userId]);
};

// module.exports.findPostsById = function (userId) {
//     const sql = `SELECT * FROM posts WHERE user_id = $1;`;
//     return db.query(sql, [userId]);
// };

// module.exports.insertPosts = function (userId, post) {
//     const sql = `
//         INSERT INTO posts (user_id, post)
//         VALUES ($1, $2)
//         RETURNING *;
//     `;
//     return db.query(sql, [userId, post]);
// };
