const defaultSettings = require("../db_words").defaultFilter;

exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(tbl) {
        // primary key
        //auth
        tbl.increments('id');
        tbl.string("username",128).notNullable().unique();
        tbl.string("authentication",2048).notNullable();

        //personal
        tbl.integer("current_streak",4096).defaultTo(0);
        tbl.integer("best_streak",4096).defaultTo(0);
        
        //settings
        tbl.string("filter", 4096).defaultTo(defaultSettings.join(","));
        tbl.integer("daily_goal").defaultTo(50);
        tbl.integer("daily_progress").defaultTo(0);

        //stats
        tbl.integer("total").defaultTo(0);
        tbl.integer("correct").defaultTo(0);
        //mood
        tbl.specificType("indicative_c","int ARRAY");
        tbl.specificType("subjunctive_c","int ARRAY");
        tbl.specificType("imperative_c","int ARRAY");
        tbl.specificType("indicative_i","int ARRAY");
        tbl.specificType("subjunctive_i","int ARRAY");
        tbl.specificType("imperative_i","int ARRAY");
        //tense
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
        tbl.specificType("preterite_archaic_c","int ARRAY");
        tbl.specificType("preterite_archaic_i","int ARRAY");
        tbl.specificType("conditional_perfect_c","int ARRAY");
        tbl.specificType("conditional_perfect_i","int ARRAY");

        tbl.timestamp('createdAt').defaultTo(knex.fn.now());
    })
}

exports.down = function(knex, Promise) {return knex.schema.dropTableIfExists('users');};

