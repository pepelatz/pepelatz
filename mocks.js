const faker = require('faker');
const TurndownService = require('turndown');

const models = require('./models');

const owner = '5addc18c6d1e240d93be34a8';

module.exports = () => {
  models.Post.remove()
    .then(() => {
      Array.from({ length: 20 }).forEach(() => {
        const turndownService = new TurndownService();

        models.Post.create({
          title: faker.lorem.words(5),
          body: turndownService.turndown(faker.lorem.words(100)),
          owner
        })
          .then(console.log)
          .catch(console.log);
      });
    })
    .catch(console.log);
};
