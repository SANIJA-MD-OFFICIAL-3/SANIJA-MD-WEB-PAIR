const { upload } = require('../mega');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { number, pairingCode } = req.body;

  if (!number || !pairingCode) {
    return res.status(400).send('Missing number or pairing code');
  }

  // Generate session data (replace this with your actual logic)
  const authData = {
    noiseKey: {
      private: { type: 'Buffer', data: '...' },
      public: { type: 'Buffer', data: '...' }
    },
    // ... other session data fields
    pairingCode,
    me: { id: `${number}@s.whatsapp.net` }
  };

  const sessionBuffer = Buffer.from(JSON.stringify(authData, null, 2));

  try {
    const url = await upload(sessionBuffer, `${number}_session.json`);
    const megaId = url.replace('https://mega.nz/file/', '');
    const sessionId = `SANIJA-MD=${megaId}`;

    // Send the session ID back in the response
    res.status(200).json({ message: 'Session created successfully', sessionId });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).send('Internal Server Error');
  }
};
