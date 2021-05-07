var express = require('express');
const {getGoogleSignInUrl, startSessionFromGoogleOAuthCode} = require("../helpers/auth");
var router = express.Router();

router.get('/google-url', function (req, res, next) {
  res.json({url: getGoogleSignInUrl()})
});

router.post('/google-auth-response', async function (req, res, next) {
  const code = req.body.code;
  try {
    const loginResult = await startSessionFromGoogleOAuthCode(code, res);
    res.json({success: true, email: loginResult.email});
  } catch (e) {
    res.json({success: false});
  }
});

module.exports = router;
