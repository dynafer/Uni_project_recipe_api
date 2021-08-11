var mysql = require('promise-mysql');
var info = require('../config');
var fs = require('fs');

// delete an existed recipe
exports.deleteRecipe = async (recipeId, author) => {
    try {
        let ret = {err: false, succ: false, err_text: ""}
        if(recipeId === undefined || recipeId === null || recipeId === 0) { ret.err = true; ret.err_text = "Access in a wrong way"; return ret; }
        if(author === undefined || author === null || author === 0) { ret.err = true; ret.err_text = "You didn't login yet"; return ret; }

        const connection = await mysql.createConnection(info.config);

        let checkAuthorSql = `SELECT authorId FROM recipe WHERE id = ?`
        let checkAuthor = await connection.query(checkAuthorSql, recipeId);
        if(checkAuthor[0].authorId !== author) { ret.err = true; ret.err_text = "Access in a wrong way"; return ret; }
        let recipeDelsql = `DELETE FROM recipe WHERE id = ?`;
        await connection.query(recipeDelsql, recipeId);
        let recipeImagesDelsql = `DELETE FROM recipeImages WHERE recipeId = ?`
        await connection.query(recipeImagesDelsql, recipeId);
        let stepsDelsql = `DELETE FROM steps WHERE recipeId = ?`
        await connection.query(stepsDelsql, recipeId);
        let stepsImagesDelsql = `DELETE FROM stepsImages WHERE recipeId = ?`
        await connection.query(stepsImagesDelsql, recipeId);
        let ingredientDelsql = `DELETE FROM ingredient WHERE recipeId = ?`
        await connection.query(ingredientDelsql, recipeId);
        // Delete all the images based on the recipe id
        if(fs.existsSync(`./public/upload/${author}/recipe/${recipeId}`)) {
            const recipeDir = fs.readdirSync(`./public/upload/${author}/recipe/${recipeId}`);
            for(let i = 0; i < recipeDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/recipe/${recipeId}/${recipeDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/recipe/${recipeId}/${recipeDir[i]}`);
                }
            }
        }
        if(fs.existsSync(`./public/upload/${author}/steps/${recipeId}`)) {
            const stepsDir = fs.readdirSync(`./public/upload/${author}/steps/${recipeId}`);
            for(let i = 0; i < stepsDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/steps/${recipeId}/${stepsDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/steps/${recipeId}/${stepsDir[i]}`);
                }
            }
        }
        if(fs.existsSync(`./public/upload/${author}/ingredients/${recipeId}`)) {
            const ingredientsDir = fs.readdirSync(`./public/upload/${author}/ingredients/${recipeId}`);
            for(let i = 0; i < ingredientsDir.length; i ++) {
                if(fs.existsSync(`./public/upload/${author}/ingredients/${recipeId}/${ingredientsDir[i]}`)) {
                    fs.unlinkSync(`./public/upload/${author}/ingredients/${recipeId}/${ingredientsDir[i]}`);
                }
            }
        }
        ret.succ = true;
        return ret;
    } catch(err) {
        throw err;
    }
}