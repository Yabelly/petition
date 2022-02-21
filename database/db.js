// THIS IS FOR THE SQL FUNCTIONALITY

const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.getAllSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSignatures = (first, last, signature) => {
    return db.query(
        `
        INSERT INTO signatures (first, last, signature)
        VALUES ($1, $2, $3)
        RETURNING first, last, signature, id
    `,
        [first, last, signature]
    );
};
module.exports.retrieveFullname = (userId) => {
    return db.query(`SELECT first, last FROM signatures WHERE id =${userId}`);
};

module.exports.retrieveSignature = (userId) => {
    return db.query(
        `SELECT first, signature FROM signatures WHERE id =${userId}`
    );
};
