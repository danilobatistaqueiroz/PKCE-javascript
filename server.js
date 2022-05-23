var express = require('express');
const cors = require('cors');

CLIENT_ID = 'ny4213rwak4bfv9'

var app = express();

app.set('view engine', 'ejs')
app.use(express.static('dist'));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  app.use(cors());
  next();
});

app.get('/', function (req, res) {
  res.render('main');
});

app.get('/authorization', function (req, res) {
  res.render('authorization');
});

app.listen(3000);
