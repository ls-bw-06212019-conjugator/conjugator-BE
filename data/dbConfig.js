const knex = require('knex');

const configOptions = require('../knexfile')[process.env.DB_ENV];
console.log(configOptions);

module.exports = knex(configOptions);