// THIS IS FOR THE SQL FUNCTIONALITY

const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

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
    return db.query(`SELECT signature FROM signatures WHERE id =$1`, [userId]);
};
