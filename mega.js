const mega = require("megajs");

const auth = {
    email: 'indranikarunarathna80@gmail.com',
    password: 'sanija1234',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
};

const upload = (dataBuffer, name) => {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, () => {
                const file = storage.upload({ name: name });
                file.end(dataBuffer);
                storage.on("add", (file) => {
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
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { upload };
