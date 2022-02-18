// THIS IS FOR THE SQL FUNCTIONALITY

const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/places`);

module.exports.getAllCities = () => {
    return db.query(`SELECT * FROM cities`);
};

module.exports.addCity = (city, pop, country) => {
    return db.query(
        `
        INSERT INTO cities (city, population, country)
        VALUES ($1, $2, $3)
        RETURNING city, country
    `,
        [city, pop, country]
    );
};
