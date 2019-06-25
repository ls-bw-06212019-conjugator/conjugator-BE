
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(tbl) {
        // primary key
        tbl.increments('id'); // or bigIncrements
        tbl.string("username",128).notNullable().unique();
        tbl.string("authentication",2048).notNullable();
        tbl.specificType("indicative_c","int ARRAY");
        tbl.specificType("subjunctive_c","int ARRAY");
        tbl.specificType("imperative_c","int ARRAY");
        tbl.specificType("indicative_i","int ARRAY");
        tbl.specificType("subjunctive_i","int ARRAY");
        tbl.specificType("imperative_i","int ARRAY");
        
        tbl.specificType("present_c","int ARRAY");
        tbl.specificType("present_i","int ARRAY");
        tbl.specificType("future_c","int ARRAY");
        tbl.specificType("future_i","int ARRAY");
        tbl.specificType("imperfect_c","int ARRAY");
        tbl.specificType("imperfect_i","int ARRAY");
        tbl.specificType("preterite_c","int ARRAY");
        tbl.specificType("preterite_i","int ARRAY");
        tbl.specificType("conditional_c","int ARRAY");
        tbl.specificType("conditional_i","int ARRAY");
        tbl.specificType("present_perfect_c","int ARRAY");
        tbl.specificType("present_perfect_i","int ARRAY");
        tbl.specificType("future_perfect_c","int ARRAY");
        tbl.specificType("future_perfect_i","int ARRAY");
        tbl.specificType("past_perfect_c","int ARRAY");
        tbl.specificType("past_perfect_i","int ARRAY");
        tbl.specificType("preterit_archaic_c","int ARRAY");
        tbl.specificType("preterit_archaic_i","int ARRAY");
        tbl.specificType("conditional_perfect_c","int ARRAY");
        tbl.specificType("conditional_perfect_i","int ARRAY");
/*      indicative_c = [wordIds];
        subjunctive_c = [wordIds];
        imperative_c = [wordIds];
        indicative_i = [wordIds];
        subjunctive_i = [wordIds];
        imperative_i = [wordIds]; */
        tbl.timestamp('createdAt').defaultTo(knex.fn.now());
    })
}

exports.down = function(knex, Promise) {return knex.schema.dropTableIfExists('users');};

