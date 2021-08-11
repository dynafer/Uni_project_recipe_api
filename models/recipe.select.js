var mysql = require('promise-mysql');
var info = require('../config');
var date = require('date-and-time');
var request = require('request');
var fs = require('fs');
/* Change because of limitation to connect the api
var AppId = "124973f9";
var AppKey = "924c2d2362521c1472e0e5782bc0ecde";
*/
var AppId = "b67a7121";
var AppKey = "c6d4c196fc772f457b42a7ea8c92b557";

// get a list of recipes (Optional: query.condition for where clause in query statement)
const getAll = async (query) => {
    try {
        let res_pagination = {results:{}, pagination:{leftArrow: false, rightArrow: false, pages: [], curpage: Number(query.page)}};
        const connection = await mysql.createConnection(info.config);
        var condition, order;
        switch(query.condition) {
            // Listed as category
            case "category":
                condition = `WHERE categoryId = ${query.cgId}`;
                order = "ORDER BY id DESC";
                break;
            // Listed as specific user
            case "user":
                let getUser = await connection.query(`SELECT id FROM users WHERE username = '${query.username}'`);
                if(getUser.length !== 0) {
                    condition = `WHERE authorId = ${getUser[0].id}`;
                    order = "ORDER BY id DESC";
                } else {
                    return false;
                }
                break;
            // Listed as specific title
            case "title":
                condition = `WHERE title LIKE '%${query.searchedTitle}%'`;
                order = "ORDER BY id DESC";
                break;
            // Listed as latest recipes created only 7 days ago
            case "latest":
                var temp = date.addDays(new Date(), -7).toISOString().replace(/T/, ' ').replace(/\..+/, '');
                condition = `WHERE dateCreated >= '${temp}'`;
                order = "ORDER BY dateCreated DESC";
                break;
            // Listed as default
            default:
                condition = "";
                order = "ORDER BY id DESC";
                break;
        }
        let sql = `SELECT id, title, authorId, dateCreated FROM recipe ${condition} ${order}`;
        let data = await connection.query(sql);
        let total_rows = data.length;
        let results_per_page = 5;
        let num_pages = Math.ceil(total_rows / results_per_page);
        let page_scale = 5;
        var temp = Math.floor((query.page - 1) / page_scale) * page_scale + 1;

        if(temp > 1) {
            res_pagination.pagination.leftArrow = true;
        } else {
            res_pagination.pagination.leftArrow = false;
        }

        for(var i = 0; i < page_scale; i++) {
            if( (temp + i) > num_pages ) { break; }
            res_pagination.pagination.pages.push(( temp + i ));
        }

        if( (temp + page_scale) <= num_pages ) {
            res_pagination.pagination.rightArrow = true;
        } else {
            res_pagination.pagination.rightArrow = false;
        }

        let startNumber = 0;

        if(query.page > 1) {
            startNumber = results_per_page * (query.page - 1);
        }
        let sqlLast, recipeData;
        if(total_rows > 0) {
            sqlLast = `SELECT id, title, authorId, dateCreated FROM recipe
                        ${condition} 
                        ${order} 
                        LIMIT ${startNumber}, ${results_per_page}`;
            recipeData = await connection.query(sqlLast);
        } else {
            sqlLast = `SELECT id, title, authorId, dateCreated FROM recipe 
                        ${condition} 
                        ${order} 
                        LIMIT ${results_per_page}`;
            recipeData = await connection.query(sqlLast);
        }
        for(var i = 0; i < recipeData.length; i ++) {
            let sqlUser = `SELECT username FROM users WHERE id = ${recipeData[i].authorId}`
            let userData = await connection.query(sqlUser);
            recipeData[i].username = userData[0].username;
        }
        res_pagination.results = recipeData;
        await connection.end();
        return res_pagination;
    } catch (error) {
        throw error;
    }
};

// get a specific recipe details with steps, ingredients, images
const viewRecipe = async (id) => {
    try {
        const connection = await mysql.createConnection(info.config);
        let recipeSQL = `SELECT * FROM recipe WHERE id = ?`;
        let getRecipe = await connection.query(recipeSQL, id);
        if(getRecipe.length === 0) return {err: true, err_msg: "The recipe doesn't exist"}
        let recipeImagesSQL = `SELECT * FROM recipeImages WHERE recipeId = ?`;
        let getRecipeImages = await connection.query(recipeImagesSQL, id);
        let ingredientsSQL = `SELECT * FROM ingredient WHERE recipeId = ?`;
        let getIngredients = await connection.query(ingredientsSQL, id);
        let stepsSQL = `SELECT * FROM steps WHERE recipeId = ?`;
        let getSteps = await connection.query(stepsSQL, id);
        let stepsImagesSQL = `SELECT * FROM stepsImages WHERE recipeId = ?`;
        let getStepsImages = await connection.query(stepsImagesSQL, id);
        if(getRecipe[0].mainimageURL !== "" && getRecipe[0].mainimageURL !== null && getRecipe[0].mainimageURL !== undefined) {
            const data = fs.readFileSync(getRecipe[0].mainimageURL);
            getRecipe[0].mainimageURL = 'data:image/png;base64,' + Buffer.from(data).toString('base64');
        }
        for(var i = 0; i < getRecipeImages.length; i++) {
            const data = fs.readFileSync(getRecipeImages[i].url);
            getRecipeImages[i].url = 'data:image/png;base64,' + Buffer.from(data).toString('base64');
        }
        for(var i = 0; i < getIngredients.length; i++) {
            getIngredients[i].nutrition = nutritionIngredient(getIngredients[i].id)
            if(getIngredients[i].mainimageURL !== "" && getIngredients[i].mainimageURL !== null && getIngredients[i].mainimageURL !== undefined) {
                const data = fs.readFileSync(getIngredients[i].mainimageURL);
                getIngredients[i].mainimageURL = 'data:image/png;base64,' + Buffer.from(data).toString('base64');
            }
        }
        for(var i = 0; i < getSteps.length; i++) {
            if(getSteps[i].mainimageURL !== "" && getSteps[i].mainimageURL !== null && getSteps[i].mainimageURL !== undefined) {
                const data = fs.readFileSync(getSteps[i].mainimageURL);
                getSteps[i].mainimageURL = 'data:image/png;base64,' + Buffer.from(data).toString('base64');
            }
        }
        for(var i = 0; i < getStepsImages.length; i++) {
            const data = fs.readFileSync(getStepsImages[i].url);
            getStepsImages[i].url = 'data:image/png;base64,' + Buffer.from(data).toString('base64');
        }
        return {recipe: getRecipe, recipeImages: getRecipeImages, ingredients: getIngredients, steps: getSteps, stepsImage: getStepsImages}
    } catch (error) {
        throw error;
    }
};

// get a nutrition value from edaman API
const nutritionIngredient = async (id) => {
    try {
        var nutritionValue;
        const connection = await mysql.createConnection(info.config);
        let ingredientSQL = `SELECT * FROM ingredient WHERE id = ?`;
        let getIngredient = await connection.query(ingredientSQL, id);
        let quantityUnitSQL = `SELECT * FROM QuantityUnit WHERE id = ?`;
        let getQuantityUnit = await connection.query(quantityUnitSQL, getIngredient[0].quantityUnitId);
        if(getQuantityUnit[0].name === "unit") {
            getQuantityUnit[0].name = ""
        }
        let ingredient = `${getIngredient[0].quantity}%20${getQuantityUnit[0].name}%20${getIngredient[0].title}`;
        await new Promise(resolve => {
            request(
                {
                    method: 'GET',
                    uri: 'https://api.edamam.com/api/nutrition-data?app_id=' + AppId + '&app_key=' + AppKey + '&ingr=' + ingredient,
                    gzip: true
                },
                (err, res, body) => {
                    if(!err) resolve(body)
                }
            )
        }).then(value => {
            nutritionValue = value
        })
        return nutritionValue;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAll, viewRecipe, nutritionIngredient
}