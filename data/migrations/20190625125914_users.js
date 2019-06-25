
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(tbl) {
        // primary key
        tbl.increments('id'); // or bigIncrements
        tbl.string("username",128).notNullable().unique();
        tbl.string("authentication",2048).notNullable();
        tbl.timestamp('createdAt').defaultTo(knex.fn.now());
    })
}

exports.down = function(knex, Promise) {return knex.schema.dropTableIfExists('users');};

