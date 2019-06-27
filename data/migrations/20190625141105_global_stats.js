exports.up = function(knex, Promise) {
    return knex.schema.createTable('global_stats', function(tbl) {
        // primary key
        tbl.increments('id'); // or bigIncrements
        tbl.bigInteger("total").defaultTo(0);
        tbl.bigInteger("correct").defaultTo(0);
        //types
        tbl.bigInteger("indicative_c");
        tbl.bigInteger("indicative_i");
        tbl.bigInteger("subjunctive_c");
        tbl.bigInteger("subjunctive_i");
        tbl.bigInteger("imperative_c");
        tbl.bigInteger("imperative_i");
        //tenses
        tbl.bigInteger("present_c");
        tbl.bigInteger("present_i");
        tbl.bigInteger("future_c");
        tbl.bigInteger("future_i");
        tbl.bigInteger("imperfect_c");
        tbl.bigInteger("imperfect_i");
        tbl.bigInteger("preterite_c");
        tbl.bigInteger("preterite_i");
        tbl.bigInteger("conditional_c");
        tbl.bigInteger("conditional_i");
        tbl.bigInteger("present_perfect_c");
        tbl.bigInteger("present_perfect_i");
        tbl.bigInteger("future_perfect_c");
        tbl.bigInteger("future_perfect_i");
        tbl.bigInteger("past_perfect_c");
        tbl.bigInteger("past_perfect_i");
        tbl.bigInteger("preterite_archaic_c");
        tbl.bigInteger("preterite_archaic_i");
        tbl.bigInteger("conditional_perfect_c");
        tbl.bigInteger("conditional_perfect_i");
    })
}

exports.down = function(knex, Promise) {return knex.schema.dropTableIfExists('global_stats');};


/*
global_stats:
   indicative_c = int
   indicative_i = int
   subjunctive_c = int
   subjunctive_i = int
   imperative_c = int
   imperative_i = int

   Present = int 
   Future = int
   Imperfect = int
   Preterite = int
   Conditional = int
   Present Perfect = int
   Future Perfect = int
   Past Perfect = int
   Preterit Archaic = int
   Conditional Perfect = int   
*/