const express = require('express');
const app = express();
const router = express.Router();

const port = 8080;

router.get('/', function(req, res){
    res.send("Hello, world!");
});

app.use('/', router);

app.listen(port, function () {
    console.log('Example app listening on port 8080!')
});
