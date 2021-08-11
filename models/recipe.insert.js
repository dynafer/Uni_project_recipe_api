var mysql = require('promise-mysql');
var info = require('../config');
var func = require('../function');
var date = require('date-and-time');
var fs = require('fs');
var path = require('path');


// insert a new recipe
exports.newRecipe = async (reciInfo, author) => {
    try {
        let ret = {err: false, succ: false, err_text: ""}
        if(author === undefined || author === null || author === 0) { ret.err = true; ret.err_text = "You don't login in yet"; return ret; }
        if(!String(reciInfo.title).trim()) { ret.err = true; ret.err_text = "Input Validation is failed"; return ret; }
        if(!String(reciInfo.subtitle).trim()) { ret.err = true; ret.err_text = "Input Validation is failed"; return ret; }
        if(!String(reciInfo.description).trim()) { ret.err = true; ret.err_text = "Input Validation is failed"; return ret; }
        if(!Number(reciInfo.categoryId)) { ret.err = true; ret.err_text = "Input Validation is failed"; return ret; }
        if(reciInfo.title.length == 0) { ret.err = true; ret.err_text = "Missing title"; return ret; }
        if(reciInfo.subtitle.length == 0) { ret.err = true; ret.err_text = "Missing subtitle"; return ret; }
        if(reciInfo.description.length == 0) { ret.err = true; ret.err_text = "Missing description"; return ret; }
        if(reciInfo.categoryId == 0) { ret.err = true; ret.err_text = "Missing category"; return ret; }
        const connection = await mysql.createConnection(info.config);
        let sql = `INSERT INTO recipe SET ?`;
        const now = new Date();
        let pushData = {title: reciInfo.title, 
                        subtitle: reciInfo.subtitle, 
                        description: reciInfo.description, 
                        categoryId: reciInfo.categoryId, 
                        authorId: author, 
                        dateCreated: date.format(now, 'YYYY/MM/DD HH:mm:ss'), 
                        dateLastModified: date.format(now, 'YYYY/MM/DD HH:mm:ss'), 
                        //mainimageURL: reciInfo.mainimageURL, 
                        ending: ""
                        }
        await connection.query(sql, pushData);
        let getId = `SELECT * FROM recipe ORDER BY id DESC LIMIT 1`;
        let getData = await connection.query(getId);

        // Add recipe images
        if(reciInfo.ordering.recipe !== undefined) {
            for(var i = 1; i <= reciInfo.ordering.recipe.length; i ++) {
                if(!fs.existsSync(`./public/upload/${author}/recipe/${getData[0].id}/`)) {
                    fs.mkdirSync(`./public/upload/${author}/recipe/${getData[0].id}/`);
                }
                let copyPath = `public/upload/${author}/recipe/${getData[0].id}/${i}${path.extname(reciInfo.ordering.recipe[i-1])}`
                fs.renameSync(`./public/upload/${author}/recipe/temp/${reciInfo.ordering.recipe[i-1]}`, `./${copyPath}`);
                let reciImageSql = `INSERT INTO recipeImages SET ?`;
                let pushURL = {url: copyPath,
                                orderReq: i,
                                recipeId: getData[0].id,
                                dateCreated: date.format(now, 'YYYY/MM/DD HH:mm:ss'),
                                deleted: 0
                            }
                await connection.query(reciImageSql, pushURL);
            }
        }

        // Add steps
        for(var i = 0; i < reciInfo.keys.length; i ++) {
            const key = reciInfo.keys[i];
            let stepSql = `INSERT INTO steps SET ?`;
            var pushSteps = {description: reciInfo.steps[key].description,
                            orderReq: (i+1),
                            recipeId: getData[0].id,
                            dateCreated: date.format(now, 'YYYY/MM/DD HH:mm:ss')
                            };
            await connection.query(stepSql, pushSteps);
        }

        // Add step images
        if(reciInfo.ordering.steps !== undefined) {
            for(var i = 1; i <= reciInfo.ordering.steps.length; i ++) {
                if(reciInfo.ordering.steps[i-1] === null) continue;
                if(!fs.existsSync(`./public/upload/${author}/steps/${getData[0].id}/`)) {
                    fs.mkdirSync(`./public/upload/${author}/steps/${getData[0].id}/`);
                }
                let copyPath = `public/upload/${author}/steps/${getData[0].id}/${i}${path.extname(reciInfo.ordering.steps[i-1])}`
                fs.renameSync(`./public/upload/${author}/steps/temp/${reciInfo.ordering.steps[i-1]}`, `./${copyPath}`);
                let stepImagesSql = `INSERT INTO stepsImages SET ?`
                var pushStepsImages = {url: copyPath,
                                        orderReq: i,
                                        recipeId: getData[0].id,
                                        dateCreated: date.format(now, 'YYYY/MM/DD HH:mm:ss'),
                                        deleted: 0
                                        }
                await connection.query(stepImagesSql, pushStepsImages);
                let updateParentStep = `UPDATE steps SET mainimageURL = ? WHERE recipeId = ? AND orderReq = ?`;
                await connection.query(updateParentStep, [copyPath, getData[0].id, i]);
            }
        }

        // Add ingredients
        for(var i = 0; i < reciInfo.ingredientKeys.length; i ++) {
            const key = reciInfo.ingredientKeys[i];
            let ingredientSql = `INSERT INTO ingredient SET ?`;
            var pushIngredients = {title: reciInfo.ingredients[key].ingredientName,
                                    quantity: reciInfo.ingredients[key].quantity,
                                    description: reciInfo.ingredients[key].description,
                                    recipeId: getData[0].id,
                                    dateCreated: date.format(now, 'YYYY/MM/DD HH:mm:ss')
                                    };
            if(reciInfo.ingredients[key].image !== undefined) {
                if(!fs.existsSync(`./public/upload/${author}/ingredients/${getData[0].id}/`)) {
                    fs.mkdirSync(`./public/upload/${author}/ingredients/${getData[0].id}/`);
                }
                let copyPath = `public/upload/${author}/ingredients/${getData[0].id}/${reciInfo.ingredients[key].ingredientName}${path.extname(reciInfo.ordering.ingredients[i])}`
                fs.renameSync(`./public/upload/${author}/ingredients/temp/${reciInfo.ordering.ingredients[i]}`, `./${copyPath}`);
                pushIngredients.mainimageURL = copyPath;
            }
            pushIngredients.quantityUnitId = func.setUnit(reciInfo.ingredients[key].unit);
            pushIngredients.categoryId = func.setCategory("ingredient", reciInfo.ingredients[key].category);
            await connection.query(ingredientSql, pushIngredients);
        }

        // Delete unchanged files in temp direcotries
        if(fs.existsSync(`./public/upload/${author}/recipe/temp`)) {
            const recipeDir = fs.readdirSync(`./public/upload/${author}/recipe/temp`);
            for(let i = 0; i < recipeDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/recipe/temp/${recipeDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/recipe/temp/${recipeDir[i]}`);
                }
            }
        }
        if(fs.existsSync(`./public/upload/${author}/steps/temp`)) {
            const stepsDir = fs.readdirSync(`./public/upload/${author}/steps/temp`);
            for(let i = 0; i < stepsDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/steps/temp/${stepsDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/steps/temp/${stepsDir[i]}`);
                }
            }
        }
        if(fs.existsSync(`./public/upload/${author}/ingredients/temp`)) {
            const ingredientsDir = fs.readdirSync(`./public/upload/${author}/ingredients/temp`);
            for(let i = 0; i < ingredientsDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/ingredients/temp/${ingredientsDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/ingredients/temp/${ingredientsDir[i]}`);
                }
            }
        }
        ret.succ = true;
        return ret;
    } catch (error) {
        throw error;
    }
};