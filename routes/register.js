var Router = require('koa-router');
var joinModel = require('../models/register');

var router = Router({
    prefix: '/api/register'
});

var bodyParser = require('koa-bodyparser');

router.post('/', bodyParser(), async (cnx, next) => {
    let checkJoin = cnx.request.body.values;
    let returned = await joinModel.checkRegister(checkJoin);
    cnx.body = returned;
});

module.exports = router;