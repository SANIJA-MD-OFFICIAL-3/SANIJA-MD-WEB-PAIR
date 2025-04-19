const express = require('express');
const fs = require('fs');
const path = require('path');
const { upload } = require('./mega');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
    const { number, pairingCode } = req.body;

    if (!number || !pairingCode) {
        return res.status(400).json({ error: 'Missing number or pairing code' });
    }

    const sessionData = {
        noiseKey: { private: { type: "Buffer", data: "..." }, public: { type: "Buffer", data: "..." } },
        pairingEphemeralKeyPair: { private: { type: "Buffer", data: "..." }, public: { type: "Buffer", data: "..." } },
        signedIdentityKey: { private: { type: "Buffer", data: "..." }, public: { type: "Buffer", data: "..." } },
        signedPreKey: {
            keyPair: { private: { type: "Buffer", data: "..." }, public: { type: "Buffer", data: "..." } },
            signature: { type: "Buffer", data: "..." },
            keyId: 1
        },
        registrationId: 254,
        advSecretKey: "YourAdvSecretKey",
        processedHistoryMessages: [],
        nextPreKeyId: 31,
        firstUnuploadedPreKeyId: 31,
        accountSyncCounter: 0,
        accountSettings: { unarchiveChats: false },
        deviceId: "DeviceID",
        phoneId: "PhoneID",
        identityId: { type: "Buffer", data: "..." },
        registered: true,
        backupToken: { type: "Buffer", data: "..." },
        registration: {},
        pairingCode: pairingCode,
        me: { id: `${number}@s.whatsapp.net`, lid: "some-lid@lid" },
        account: {
            details: "AccountDetails",
            accountSignatureKey: "AccountSignatureKey",
            accountSignature: "AccountSignature",
            deviceSignature: "DeviceSignature"
        },
        signalIdentities: [{
            identifier: { name: `${number}@s.whatsapp.net`, deviceId: 0 },
            identifierKey: { type: "Buffer", data: "..." }
        }],
        platform: "android",
        lastAccountSyncTimestamp: Date.now(),
        myAppStateKeyId: "AAAAABaO"
    };

    const filename = `${number}_session.json`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2));

    try {
        const fileStream = fs.createReadStream(filepath);
        const megaUrl = await upload(fileStream, filename);
        fs.unlinkSync(filepath); // delete file after upload

        const sessionID = megaUrl.replace('https://mega.nz/file/', '');
        res.json({ message: `SANIJA-MD=${sessionID}` });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload to Mega' });
    }
});

app.listen(PORT, () => {
    console.log(`SANIJA-MD Server Running on port ${PORT}`);
});
