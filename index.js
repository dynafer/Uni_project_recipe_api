'use strict'

const Koa = require('koa');
const cors = require('koa2-cors');
const session = require('koa-session');
const home = require('./routes/welcome');
const auth = require('./routes/authentication');
const logout = require('./routes/logout');
const register = require('./routes/register');
const admin = require('./routes/admin');
const _session = require('./routes/session');

const recipeGet = require('./routes/recipe.get');
const recipePost = require('./routes/recipe.post');
const recipePut = require('./routes/recipe.put');
const recipeDel = require('./routes/recipe.del');
const app = new Koa();


app.keys = ['darkSecret'];
app.use(cors({
    origin: function(ctx) {
      return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 30,
    credentials: true,
    allowedMethods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));
app.use(session(app));
app.use(home.routes());
app.use(home.allowedMethods());
app.use(auth.routes());
app.use(auth.allowedMethods());
app.use(logout.routes());
app.use(logout.allowedMethods());
app.use(register.routes());
app.use(register.allowedMethods());
app.use(admin.routes());
app.use(admin.allowedMethods());
app.use(recipeGet.routes());
app.use(recipeGet.allowedMethods());
app.use(recipePost.routes());
app.use(recipePost.allowedMethods());
app.use(recipePut.routes());
app.use(recipePut.allowedMethods());
app.use(recipeDel.routes());
app.use(recipeDel.allowedMethods());
app.use(_session.routes());
app.use(_session.allowedMethods());

var port = process.env.PORT || 5000;

app.listen(port);