var Router = require('koa-router');

var router = Router({
    prefix: '/api/logout'
});

router.get('/', async (cnx, next) => {
    cnx.session.authenticated = null;
    cnx.session.userid = null;
    cnx.session.username = null;
    cnx.body = cnx.session;
});

module.exports = router;