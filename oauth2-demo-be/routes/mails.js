const router = require('express').Router();
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauth'
);

router.get('/', async function (req, res, next) {
  const tokens = req.tokens;

  oauth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const messages = await getMessageList(gmail);
    if (messages && messages.length) {
      const fullMessages = await getFullMessageList(gmail, messages);
      console.log('messages', fullMessages);
      return res.status(200).json({
        status: 'ok',
        messages: fullMessages,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
});

async function getMessageList(gmail) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10,
    });

    const messages = response.data.messages;
    return messages; // This will now correctly return the messages from the function
  } catch (err) {
    console.log('The API returned an error: ' + err);
    return []; // Return an empty array or handle the error as appropriate
  }
}

async function getFullMessageList(gmail, messages) {
  try {
    const fullMessages = await Promise.all(
      messages.map(async (m) => {
        const { data } = await gmail.users.messages.get({
          userId: 'me',
          id: m.id,
        });
        return data;
      })
    );
    return fullMessages;
  } catch (error) {
    console.log('fail to get messages', error);
    return [];
  }
}

module.exports = router;
