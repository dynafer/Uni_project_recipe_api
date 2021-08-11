var Router = require('koa-router');
var adminModel = require('../models/admin');

var router = Router({
    prefix: '/api/admin'
});

router.post('/create_db', async (ctx, next) => {
    let item = await adminModel.createTables(ctx.params.id);
    ctx.body = item;
});

module.exports = router;