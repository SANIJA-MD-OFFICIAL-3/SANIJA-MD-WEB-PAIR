const mega = require('megajs');

const auth = {
  email: 'indranikarunarathna80@gmail.com',
  password: 'sanija1234',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
};

const upload = (dataBuffer, name) => {
  return new Promise((resolve, reject) => {
    const storage = new mega.Storage(auth, () => {
      const file = storage.upload({ name });
      file.end(dataBuffer);
      storage.on('add', file => {
        file.link((err, url) => {
          if (err) {
            reject(err);
            return;
          }
          storage.close();
          resolve(url);
        });
      });
    });
  });
};

module.exports = { upload };
