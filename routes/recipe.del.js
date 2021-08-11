var Router = require('koa-router');
var recipeDelete = require('../models/recipe.delete');

var router = Router({
    prefix: '/api/recipe'
});

// delete a recipe
router.del('/delete/:id([0-9]{1,})', async (cnx, next) => {
    let ret = await recipeDelete.deleteRecipe(cnx.params.id, cnx.session.userid)
    cnx.body = ret;
});

module.exports = router;