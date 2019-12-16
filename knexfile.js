module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.HOST,
      port: 5432,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      ssl: false
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: {
      directory: './data/seeds'
    },
    useNullAsDefault: true
  },
};
