var Router = require('koa-router');
var recipeSelect = require('../models/recipe.select');
var func = require('../function');

var router = Router({
    prefix: '/api/recipe'
});


// Show a recipe list in dependence on a page number
// Redirect to view all list with 1 of page numbers if there is no page number in url
router.get('/', async (cnx, next) => {
    if(cnx.query.page !== undefined) {
        let returned = await recipeSelect.getAll({page: cnx.query.page});
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/?page=1'));
    }
});

// Show a latest recipes list in dependence on a page number
router.get('/latest', async (cnx, next) => {
    if(cnx.query.page !== undefined) {
        let returned = await recipeSelect.getAll({condition: "latest", page: cnx.query.page});
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/latest/?page=1'));
    }
});

// Show a recipe list related to category in dependence on a page number
// Redirect to view all list with 1 of page numbers if there is no category number
router.get('/category/:categoryName', async (cnx, next) => {
    if(cnx.query.page !== undefined) {
        var categoryId = func.setCategory("recipe", cnx.params.categoryName);
        let returned = await recipeSelect.getAll({condition: "category", cgId: categoryId, page: cnx.query.page});
        cnx.body = returned;
    } else if(cnx.params.categoryName === undefined || cnx.params.categoryName === null || cnx.params.categoryName === "") {
        cnx.redirect(Router.url('/api/recipe/?page=1'));
    } else {
        cnx.redirect(Router.url('/api/recipe/category/:categoryName/?page=1', {categoryName: cnx.params.categoryName}));
    }
});

// When user searches a specific user, show a list related to the user
// Redirect if there is no parameter of page
router.get('/search/user/:username', async (cnx, next) => {
    if(cnx.query.page !== undefined) {
        let returned = await recipeSelect.getAll({condition: "user", username: cnx.params.username, page: cnx.query.page});
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/search/user/:username/?page=1', {username: cnx.params.username}));
    }
});

// When user searches a title, show a list related to the title
// Redirect if there is no parameter of page
router.get('/search/title/:searchedTitle', async (cnx, next) => {
    if(cnx.query.page !== undefined) {
        let returned = await recipeSelect.getAll({condition: "title", searchedTitle: cnx.params.searchedTitle, page: cnx.query.page});
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/search/title/:searchedTitle/?page=1', {searchedTitle: cnx.params.searchedTitle}));
    }
});

// Show a recipe that user selected
router.get('/view/:id([0-9]{1,})', async (cnx, next) => {
    let returned = await recipeSelect.viewRecipe(cnx.params.id);
    if(cnx.query.page === undefined || cnx.query.page === 0) cnx.query.page = 1;
    if(returned.err === undefined) {
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/?page=' + cnx.query.page));
    }
});

// Show a recipe that user selected
router.get('/category/:categoryName/view/:id([0-9]{1,})', async (cnx, next) => {
    let returned = await recipeSelect.viewRecipe(cnx.params.id);
    if(returned.err === undefined) {
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/category/:categoryName/?page=' + cnx.query.page, {categoryName: cnx.params.categoryName}));
    }
});

// Show a recipe that user selected
router.get('/search/user/:username/view/:id([0-9]{1,})', async (cnx, next) => {
    let returned = await recipeSelect.viewRecipe(cnx.params.id);
    if(cnx.query.page === undefined || cnx.query.page === 0) cnx.query.page = 1;
    if(returned.err === undefined) {
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/search/user/:username/?page=' + cnx.query.page, {username: cnx.params.username}));
    }
});

// Show a recipe that user selected
router.get('/search/title/:searchedTitle/view/:id([0-9]{1,})', async (cnx, next) => {
    let returned = await recipeSelect.viewRecipe(cnx.params.id);
    if(cnx.query.page === undefined || cnx.query.page === 0) cnx.query.page = 1;
    if(returned.err === undefined) {
        cnx.body = returned;
    } else {
        cnx.redirect(Router.url('/api/recipe/search/title/:searchedTitle/?page=' + cnx.query.page, {searchedTitle: cnx.params.searchedTitle}));
    }
});

// Get a nutrition value
router.get('/ingredient/nutrition/:id([0-9]{1,})', async (cnx, next) => {
    let returned = await recipeSelect.nutritionIngredient(cnx.params.id);
    cnx.body = returned;
});

module.exports = router;