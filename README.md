**Server**
https://bw-conjugator.herokuapp.com/

| Method        | Endpoint      | Data in  | Data out | description|
| ------------- |:-------------:| -----:|  -----:|  -----:|
| post | /api/register |  {username, password} | {token} | pass in a username and password and creates a new account for you and returns you a token to be stored and reused|
| post | /api/login | {username, password} | {token} | pass in a username and password and validates your user exist and password is correct then sends you a token to store
| get  | /api/words | header: token(optional) {filter: [optional]} | {id, infinitive, type, tense, form, infinitive_english, answer} | pass a token and get automatic filtering based on the users settings, or pass no token and just a filter key value and get filtering based on that, or pass nothing and get default values. |
| get | /api/words/:id | {} | {id,infinitive, infinitive_english} | pass an id in the url and get the word associated to that id | 
| post | /api/words | {id, infinitive, type, tense, form, infinitive_english, answer, correct} | "added global and personal" or "added global only" | pass in object recieved from get call with new key value correct (0,1) to udate global data. If you want to update account data must pass a token in the header (token: token)
| get | /api/stats | {} | {global: {global stats}, personal: {personal stats}} | will pass back global stats always and pass back personal stats if token is recieved.
| get | /api/settings | header: token {} | {filter: []} | give a token and get the settings that have been set by this user |
| set | /api/settings | header: token {filter: []} | {} | give a token and an array of string filters to update the users settings |



#### global and personal stats recorded:
##### Mood:
##### indicative_c: 0,
##### indicative_i: 0,
##### subjunctive_c: 0,
##### subjunctive_i: 0,
##### imperative_c: 0,
##### imperative_i: 0,

###### tenses:
##### present_c: 0,
##### present_i: 0,
##### future_c: 0,
##### future_i: 0,
##### imperfect_c: 0,
##### imperfect_i: 0,
##### preterite_c: 0,
##### preterite_i: 0,
##### conditional_c: 0,
##### conditional_i: 0,
##### present_perfect_c: 0,
##### present_perfect_i: 0,
##### future_perfect_c: 0,
##### future_perfect_i: 0,
##### past_perfect_c: 0,
##### past_perfect_i: 0,
##### preterit_archaic_c: 0,
##### preterit_archaic_i: 0,
##### conditional_perfect_c: 0,
##### conditional_perfect_i: 0
