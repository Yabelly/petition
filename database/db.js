// THIS IS FOR THE SQL FUNCTIONALITY

const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

module.exports.getAllSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};
module.exports.registration = (first, last, email, password) => {
    return db.query(
        `
    INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [first, last, email, password]
    );
};
module.exports.retrieveEmailPassword = (email) => {
    return db.query(`SELECT id, password FROM users WHERE email=$1`, [email]);
};

module.exports.addSignatures = (userId, signature) => {
    return db.query(
        `
        INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING *
    `,
        [userId, signature]
    );
};

module.exports.retrieveSignature = (userId) => {
    return db.query(`SELECT * FROM signatures WHERE user_id = $1`, [userId]);
};

module.exports.addProfile = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [age, city, url, user_id]
    );
};
module.exports.retrieveNameAgeCity = () => {
    return db.query(
        `
        SELECT users.first, users.last, user_profiles.age, user_profiles.url, user_profiles.city, signatures.user_id
        FROM users
        JOIN signatures
        ON users.id = signatures.user_id
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        `
    );
};
module.exports.retrieveCity = (city) => {
    return db.query(
        `
        SELECT users.first, users.last, user_profiles.age, user_profiles.url 
        FROM users
        JOIN signatures
        ON users.id = signatures.user_id
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE LOWER(user_profiles.city) = LOWER($1)
        `,
        [city]
    );
};

module.exports.retrieveForEdit = (userId) => {
    return db.query(
        `
        SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE user_id = ($1)
        
        
        `,
        [userId]
    );
};

module.exports.updateFirstLastEmail = (first, last, email, userId) => {
    return db.query(
        `
    UPDATE users
       SET first = $1,
       last = $2,
       email = $3
         WHERE id = $4
    `,
        [first, last, email, userId]
    );
};

module.exports.updateFirstLastEmailPassword = (
    first,
    last,
    email,
    hashedPassword,
    userId
) => {
    return db.query(
        `
        UPDATE users
        SET first = $1,
        last = $2,
        email = $3,
        password = $4
        WHERE id = $5
        `,
        [first, last, email, hashedPassword, userId]
    );
};

module.exports.upsertUserProfiles = (age, city, url, userId) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3
        `,
        [age, city, url, userId]
    );
};

module.exports.removeSig = (userId) => {
    return db.query(
        `
        DELETE FROM signatures 
        WHERE user_id = $1
    `,
        [userId]
    );
};
