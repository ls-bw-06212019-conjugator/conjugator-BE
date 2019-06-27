const request = require('supertest'); // calling it "request" is a common practice

const server = require('./index'); // this is our first red, file doesn't exist yet
//added this line so i coudl push to the branch
describe('index.js', () => {
  // http calls made with supertest return promises, we can use async/await if desired
  describe('index route', () => {

    it('testing get stats functionalty', async () => {
        let response = await request(server).get('api/stats');
        expect(response.status).toEqual(200);
        expect(response.body.global).toBeDefined(); //check we get good data
      });
    it('testing getting words funcitonality', async () => {
        // do a get request to our api (server.js) and inspect the response
        let response = await request(server).get('api/words') //test correct
        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

      });
      it('testing delete functionality', async () => {
        // do a get request to our api (server.js) and inspect the response
        let response = await request(server).get('api/settings');
        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
      });
  });
});