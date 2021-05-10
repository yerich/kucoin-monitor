const google = require("googleapis").google;
const dynamoDBClient = require("../../lib/dynamoDBClient");

const googleAuthScopes = [
  'email',
  'profile',
  'openid',
]

function createConnection() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/google-oauth',
  );
}

function getConnectionUrl(connection) {
  return connection.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
    scope: googleAuthScopes
  });
}

function getGoogleSignInUrl() {
  return getConnectionUrl(createConnection());
}

function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth });
}

/**
 * Extract the email and id of the google account from the "code" parameter.
 */
async function getGoogleAccountFromCode(code) {
  const connection = createConnection();

  const data = await connection.getToken(code);
  const tokens = data.tokens;

  connection.setCredentials(tokens);
  const oauth2 = google.oauth2({version: 'v2'});
  const res = await oauth2.tokeninfo({
    access_token: tokens.access_token,
    id_token: tokens.id_token,
  });
  console.log(res.data);
  return {
    email: res.data.email,
    verified_email: res.data.verified_email
  }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

async function startSessionFromGoogleOAuthCode(code, res) {
  const googleResult = await getGoogleAccountFromCode(code);
  const result = await dynamoDBClient.query({
    TableName: "users",
    KeyConditionExpression: "email = :a",
    ExpressionAttributeValues: {
      ":a": googleResult.email,
    },
  }).promise();

  if (!result || !result.Items || !result.Items[0] || !result.Items[0].email) {
    throw new Error("Unauthorized user");
  } else {
    const sessionId = generateUUID();
    const user = result.Items[0];

    await dynamoDBClient.put({
      TableName: "sessions",
      Item: {
        "session_id": sessionId,
        "expire": Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 365,
        "email": user.email,
      }
    }).promise();

    res.cookie("sessionId", sessionId, {maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true});

    return user;
  }
}

async function checkSession(req, res, next) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    res.statusCode(401);
    res.json({error: "Login required"});
    return;
  }

  const result = await dynamoDBClient.query({
    TableName: "sessions",
    KeyConditionExpression: "session_id = :a",
    ExpressionAttributeValues: {
      ":a": sessionId,
    },
  }).promise();

  if (!result || !result.Items || !result.Items[0] || !result.Items[0].email) {
    res.statusCode(401);
    res.json({error: "Login required"});
  } else {
    req.sessionInfo = result.Items[0];
    next();
  }
}

async function deleteSession(sessionId) {
  return await dynamoDBClient.delete({
    TableName: "sessions",
    Key: {
      "session_id": sessionId
    },
  }).promise();
}

module.exports = {
  getGoogleSignInUrl,
  getGoogleAccountFromCode,
  startSessionFromGoogleOAuthCode,
  checkSession,
  deleteSession,
}
