var Router = require('koa-router');
var recipeUpdate = require('../models/recipe.update');
var func = require('../function');
var router = Router({
    prefix: '/api/recipe'
});

var bodyParser = require('koa-bodyparser');

// Edit the recipe that user edited in default URL
router.put('/view/:id([0-9]{1,})', bodyParser(), async (cnx, next) => {
    let getBody = cnx.request.body.values;
    getBody.categoryId = func.setCategory("recipe", getBody.category);
    let ret = await recipeUpdate.updateRecipe(getBody, cnx.params.id, cnx.session.userid)
    cnx.body = ret;
});

// Edit the recipe that user edited in category URL
router.put('/category/:categoryName/view/:id([0-9]{1,})', bodyParser(), async (cnx, next) => {
    let getBody = cnx.request.body.values;
    getBody.categoryId = func.setCategory("recipe", getBody.category);
    let ret = await recipeUpdate.updateRecipe(getBody, cnx.params.id, cnx.session.userid)
    cnx.body = ret;
});

// Edit the recipe that user edited in searched user URL
router.put('/search/user/:username/view/:id([0-9]{1,})', bodyParser(), async (cnx, next) => {
    let getBody = cnx.request.body.values;
    getBody.categoryId = func.setCategory("recipe", getBody.category);
    let ret = await recipeUpdate.updateRecipe(getBody, cnx.params.id, cnx.session.userid)
    cnx.body = ret;
});

// Edit the recipe that user edited in searched title URL
router.put('/search/title/:searchedTitle/view/:id([0-9]{1,})', bodyParser(), async (cnx, next) => {
    let getBody = cnx.request.body.values;
    getBody.categoryId = func.setCategory("recipe", getBody.category);
    let ret = await recipeUpdate.updateRecipe(getBody, cnx.params.id, cnx.session.userid)
    cnx.body = ret;
});

module.exports = router;