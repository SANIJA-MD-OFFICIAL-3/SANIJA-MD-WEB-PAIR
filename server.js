const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { upload } = require('./mega');
const { sendMessage } = require('./whatsapp');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Home Page (Form)
app.get('/', (req, res) => {
    res.send(`
        <h1>SANIJA-MD - WhatsApp Auth Generator</h1>
        <form method="POST" action="/pair">
            <label>Enter your WhatsApp number:</label><br><br>
            <input type="text" name="number" required><br><br>
            <button type="submit">Generate Session</button>
        </form>
    `);
});

// Handle Pairing
app.post('/pair', async (req, res) => {
    const number = req.body.number;
    const pairingCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create Fake Auth Data
    const authData = {
        noiseKey: {
            private: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') },
            public: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') }
        },
        pairingEphemeralKeyPair: {
            private: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') },
            public: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') }
        },
        signedIdentityKey: {
            private: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') },
            public: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') }
        },
        signedPreKey: {
            keyPair: {
                private: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') },
                public: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') }
            },
            signature: { type: "Buffer", data: Buffer.from(Math.random().toString()).toString('base64') },
            keyId: 1
        },
        registrationId: Math.floor(Math.random() * 1000),
        advSecretKey: Buffer.from(Math.random().toString()).toString('base64'),
        processedHistoryMessages: [],
        nextPreKeyId: 31,
        firstUnuploadedPreKeyId: 31,
        accountSyncCounter: 0,
        accountSettings: { unarchiveChats: false },
        deviceId: "device_" + Math.random().toString(36).substring(2, 10),
        phoneId: "phone_" + Math.random().toString(36).substring(2, 10),
        registered: true,
        pairingCode: pairingCode,
        me: {
            id: `${number}@s.whatsapp.net`,
            lid: "lid_example"
        }
    };

    // Save temp file
    const tempPath = `./${number}_session.json`;
    fs.writeFileSync(tempPath, JSON.stringify(authData, null, 2));

    // Upload to Mega
    const fileStream = fs.createReadStream(tempPath);
    try {
        const url = await upload(fileStream, `${number}_session.json`);
        const megaId = url.replace('https://mega.nz/file/', ''); // Only ID#KEY part
        const sessionId = `SANIJA-MD SESSION ID: ${megaId}`;

        // Send "Session ID" to user
        sendMessage(number, `✅ Your SANIJA-MD session is ready!\n\n${sessionId}\n\n⚡ Powered by SANIJA-MD`);

        res.send(`<h1>Session Created!</h1><p>Check your WhatsApp inbox!</p><br><br><p>${sessionId}</p>`);
    } catch (error) {
        console.error(error);
        res.send('❌ Upload failed. Try again later.');
    }

    // Delete temp file
    fs.unlinkSync(tempPath);
});

// Start server
app.listen(port, () => {
    console.log(`SANIJA-MD server running at http://localhost:${port}`);
});
