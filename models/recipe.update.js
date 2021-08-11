var mysql = require('promise-mysql');
var info = require('../config');
var date = require('date-and-time');
var func = require('../function');
var fs = require('fs');

// update an existed recipe
exports.updateRecipe = async (reciInfo, reciId, author) => {
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

        let sql = `SELECT * FROM recipe WHERE id = ?`;
        let data = await connection.query(sql, reciId);
        if(data.length === 0) {
            ret.err = true;
            ret.err_text = "The recipe doesn't exist";
            return ret;
        }

        let sql2 = `UPDATE recipe SET title = ?, subtitle = ?, description = ?, categoryId = ?, dateLastModified = ? WHERE id = ?`;
        const now = new Date();
        await connection.query(sql2, [reciInfo.title, reciInfo.subtitle, reciInfo.description, reciInfo.categoryId, date.format(now, 'YYYY/MM/DD HH:mm:ss'), reciId]);

        let getData = data;

        // Delete and reinsert recipe images
        await connection.query(`DELETE FROM recipeImages WHERE recipeId = ?`, reciId);
        // Delete recipe images
        if(fs.existsSync(`./public/upload/${author}/recipe/temp`)) {
            if(!fs.existsSync(`./public/upload/${author}/recipe/${reciId}`)) {
                fs.mkdirSync(`./public/upload/${author}/recipe/${reciId}`);
            }
            const recipeDir = fs.readdirSync(`./public/upload/${author}/recipe/${reciId}`);
            for(let i = 0; i < recipeDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/recipe/${reciId}/${recipeDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/recipe/${reciId}/${recipeDir[i]}`);
                }
            }
        }
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

        // Delete and reinsert steps and images
        await connection.query(`DELETE FROM steps WHERE recipeId = ?`, reciId);
        await connection.query(`DELETE FROM stepsImages WHERE recipeId = ?`, reciId);
        // Delete step images
        if(fs.existsSync(`./public/upload/${author}/steps/${reciId}`)) {
            const stepsDir = fs.readdirSync(`./public/upload/${author}/steps/${reciId}`);
            for(let i = 0; i < stepsDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/steps/${reciId}/${stepsDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/steps/${reciId}/${stepsDir[i]}`);
                }
            }
        }

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

        // Delete and reinsert ingredients and images
        await connection.query(`DELETE FROM ingredient WHERE recipeId = ?`, reciId);
        // Delete ingredient images
        if(fs.existsSync(`./public/upload/${author}/ingredients/${reciId}`)) {
            const ingredientsDir = fs.readdirSync(`./public/upload/${author}/ingredients/${reciId}`);
            for(let i = 0; i < ingredientsDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/ingredients/${reciId}/${ingredientsDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/ingredients/${reciId}/${ingredientsDir[i]}`);
                }
            }
        }
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
}