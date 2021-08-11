var Router = require('koa-router');
var recipeInsert = require('../models/recipe.insert');
var func = require('../function');

var router = Router({
    prefix: '/api/recipe'
});

var bodyParser = require('koa-bodyparser');
var fs = require('fs');
var multer = require('koa-multer')
let storage = multer.diskStorage({
    destination: function(req, file, callback) {
       callback(null, './public/upload/')
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname)
    }
})
var uploadImageMulter = multer({storage: storage});


// Add a new recipe
router.post('/newRecipe', bodyParser(), async (cnx, next) => {
    let getBody = cnx.request.body.values;
    getBody.ordering = cnx.request.body.ordering;
    getBody.categoryId = func.setCategory("recipe", getBody.category);
    let ret = await recipeInsert.newRecipe(getBody, cnx.session.userid)
    cnx.body = ret;
});

// Add a temp image to the server
router.post('/newRecipe/uploadImages/:type', uploadImageMulter.array("file"), cnx => {
    try {
        if(!fs.existsSync(`./public/upload/${cnx.session.userid}/`)) {
            fs.mkdirSync(`./public/upload/${cnx.session.userid}/`);
        }
        if(!fs.existsSync(`./public/upload/${cnx.session.userid}/${cnx.params.type}/`)) {
            fs.mkdirSync(`./public/upload/${cnx.session.userid}/${cnx.params.type}/`);
        }
        if(!fs.existsSync(`./public/upload/${cnx.session.userid}/${cnx.params.type}/temp/`)) {
            fs.mkdirSync(`./public/upload/${cnx.session.userid}/${cnx.params.type}/temp/`);
        }
        while(true) {
            if(!fs.existsSync(`./public/upload/${cnx.req.files[0].originalname}`)) {
                continue;
            } else {
                fs.renameSync(`./public/upload/${cnx.req.files[0].originalname}`,
                `./public/upload/${cnx.session.userid}/${cnx.params.type}/temp/${cnx.req.files[0].originalname}`);
                break;
            }
        }
    } catch (e) {
        console.log(e);
    }
    cnx.body = {path: cnx.req.files[0].originalname, type: cnx.params.type};
});

// delete unchanged images in temp folder
router.post('/newRecipe/deleteTempImage/:type', bodyParser(), cnx => {
    fs.unlinkSync(`./public/upload/${cnx.session.userid}/${cnx.params.type}/temp/${cnx.request.body.name}`);
    cnx.body = {succ: true};
});

module.exports = router;