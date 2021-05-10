const express = require('express');
const {getGoogleSignInUrl, startSessionFromGoogleOAuthCode, checkSession, deleteSession} = require("../helpers/auth");
const router = express.Router();

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

router.get('/session', checkSession, async function (req, res, next) {
  res.json({success: true, sessionInfo: req.sessionInfo});
});

router.get('/sign-out', checkSession, async function (req, res) {
  try {
    const loginResult = await deleteSession(req.sessionInfo.session_id);
    res.cookie("sessionId", "", {maxAge: 0});
    res.json({success: true});
  } catch (e) {
    res.json({success: false});
  }
});

module.exports = router;
