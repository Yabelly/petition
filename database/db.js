// THIS IS FOR THE SQL FUNCTIONALITY

const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.getAllSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addsignatures = (first, last) => {
    return db.query(
        `
        INSERT INTO signatures (first, last)
        VALUES ($1, $2)
        RETURNING first, last
    `,
        [first, last]
    );
};

// module.exports.addsignatures = (first, last, signature) => {
//     return db.query(
//         `
//         INSERT INTO signatures (first, last, signature)
//         VALUES ($1, $2, $3)
//         RETURNING first, last
//     `,
//         [first, last, signature]
//     );
// };
