var Router = require('koa-router');

var router = Router({
    prefix: '/api/session'
});

router.get('/', async (cnx, next) => {
    cnx.body = cnx.session;
});

module.exports = router;