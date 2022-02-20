// THIS IS FOR THE SQL FUNCTIONALITY

const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/places`);

module.exports.getAllSigners = () => {
    return db.query(`SELECT * FROM signers`);
};

module.exports.addsignatures = (first, last, signature) => {
    return db.query(
        `
        INSERT INTO petition (first, last, signature)
        VALUES ($1, $2, $3)
        RETURNING first, last
    `,
        [first, last, signature]
    );
};
