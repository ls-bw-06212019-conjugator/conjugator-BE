module.exports = {
  development: {
    client: 'pg',
    connection: {
      // host: 'ec2-54-221-214-3.compute-1.amazonaws.com',
      host: process.env.HOST,
      port: 5432,
      // user: 'oerbziclxtwpxt',
      user: process.env.USER,
      // password: '658a1230ea308d76f935c6ea47dabbabbb668c48f12b84db5b19dc1de7e390de',
      password: process.env.PASSWORD,
      // database: 'd6qfbdc55m8h1k',
      database: process.env.DATABASE,
      ssl: true
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
