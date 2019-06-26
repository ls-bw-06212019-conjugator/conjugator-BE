
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([]); //making this blank due to an error
      //there will be no defualt users cuz there is no point to this
    });
};
