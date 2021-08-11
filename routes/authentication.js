var Router = require('koa-router');
var authModel = require('../models/authentication');

var router = Router({
    prefix: '/api/auth'
});

var bodyParser = require('koa-bodyparser');


router.post('/', bodyParser(), async (cnx, next) => {
    let authLogin = cnx.request.body.values;
    let res = await authModel.authenticateLogin(authLogin);
    if(res.success === true) {
        cnx.session.authenticated = true;
        cnx.session.userid = res.userid;
        cnx.session.username = res.username;
        cnx.body = {authenticated: true, userid: cnx.session.userid, username: cnx.session.username};
    } else {
        cnx.session.authenticated = null;
        cnx.session.userid = null;
        cnx.session.username = null;
        cnx.body = {authenticated: null, userid: null, username: null};
    }
});

module.exports = router;