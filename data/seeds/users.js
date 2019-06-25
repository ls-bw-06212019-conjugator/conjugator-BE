
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, username: 'a', authentication: '1'},
        {id: 2, username: 'b', authentication: '2'},
        {id: 3, username: 'c', authentication: '3'}
      ]);
    });
};
