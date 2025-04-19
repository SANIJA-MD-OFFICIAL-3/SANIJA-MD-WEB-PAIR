const mega = require('megajs');

const auth = {
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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
