
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('global_stats').del()
    .then(function () {
      // Inserts seed entries
      return knex('global_stats').insert([
        {id: 1, 
          //types
          indicative_c: 0,
          indicative_i: 0,
          subjunctive_c: 0,
          subjunctive_i: 0,
          imperative_c: 0,
          imperative_i: 0,
          
          //tenses
          present_c: 0,
          present_i: 0,
          future_c: 0,
          future_i: 0,
          imperfect_c: 0,
          imperfect_i: 0,
          preterite_c: 0,
          preterite_i: 0,
          conditional_c: 0,
          conditional_i: 0,
          present_perfect_c: 0,
          present_perfect_i: 0,
          future_perfect_c: 0,
          future_perfect_i: 0,
          past_perfect_c: 0,
          past_perfect_i: 0,
          preterite_archaic_c: 0,
          preterite_archaic_i: 0,
          conditional_perfect_c: 0,
          conditional_perfect_i: 0
        }
      ]);
    });
};
