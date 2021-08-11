var mysql = require('promise-mysql');
var info = require('../config');
var fs = require('fs');
exports.createTables = async (id)=> {
    try {
        const connection = await mysql.createConnection(info.config); 
        let sql = `CREATE TABLE users (
            id INT NOT NULL AUTO_INCREMENT, 
            username VARCHAR(32),
            password VARCHAR(256),
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE recipe (
            id INT NOT NULL AUTO_INCREMENT, 
            title VARCHAR(100),
            subtitle VARCHAR(100),
            description Text, 
            categoryId int(32),
            authorId int(32),
            dateCreated DATETIME,
            dateLastModified DATETIME,
            mainimageURL text,
            ending text,
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE ingredient (
            id INT NOT NULL AUTO_INCREMENT, 
            title VARCHAR(100),
            quantity int(32),
            quantityUnitId int(32),
            description Text, 
            categoryId int(32),
            recipeId int(32),
            dateCreated DATETIME,
            mainimageURL text,
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE steps (
            id INT NOT NULL AUTO_INCREMENT, 
            description Text, 
            orderReq int(32),
            recipeId int(32),
            dateCreated DATETIME,
            mainimageURL text,
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE recipeImages (
            id INT NOT NULL AUTO_INCREMENT, 
            url text,
            orderReq int(32),
            recipeId int(32),
            dateCreated DATETIME,
            deleted tinyint(1) ZEROFILL,
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE stepsImages (
            id INT NOT NULL AUTO_INCREMENT, 
            url text,
            orderReq int(32),
            recipeId int(32),
            dateCreated DATETIME,
            deleted tinyint(1) ZEROFILL,
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE QuantityUnit (
            id INT NOT NULL AUTO_INCREMENT, 
            name VARCHAR(100),
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        sql = `CREATE TABLE Category (
            id INT NOT NULL AUTO_INCREMENT, 
            name VARCHAR(100),
            description text,
            imageURL text,
            PRIMARY KEY (ID)
        )`;
        await connection.query(sql);
        
        for(var i = 0; i < 10; i++) {
            let autoCategory = `INSERT INTO Category SET ?;`
            var pushData;
            if(i === 0) {
                pushData = {name: "Breakfast",
                description: "Breakfast Category",
                imageURL: "https://thumbor.thedailymeal.com/eakBw6ct7y0NoE7boW9vN72Hsbw=/870x565/filters:focal(600x400:601x401):format(webp)/https://www.thedailymeal.com/sites/default/files/2019/01/18/0-Utah-MAIN2.jpg"}
            } else if(i === 1) {
                pushData = {name: "Lunch",
                description: "Lunch Category",
                imageURL: "http://www.taureauxtavern.com/assets/images/tt1.jpg"}
            } else if(i === 2) {
                pushData = {name: "Dinner",
                description: "Dinner Category",
                imageURL: "https://vonvino.com/wp-content/uploads/2016/07/Dinner_Banquet_Table-860x450.jpg"}
            } else if(i === 3) {
                pushData = {name: "Dessert",
                description: "Dessert Category",
                imageURL: "https://assets.kraftfoods.com/recipe_images/opendeploy/204595_640x428.jpg"}
            } else if(i === 4) {
                pushData = {name: "Snack",
                description: "Snack Category",
                imageURL: "https://www.supermarketperimeter.com/ext/resources/2019/5/SnackVariety_Lead.jpg?1558559321"}
            } else if(i === 5) {
                pushData = {name: "Vegetable",
                description: "Vegetable Ingredient Category",
                imageURL: "https://cdn.britannica.com/17/196817-050-6A15DAC3/vegetables.jpg"}
            } else if(i === 6) {
                pushData = {name: "Fruit",
                description: "Fruit Ingredient Category",
                imageURL: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/assortment-of-colorful-ripe-tropical-fruits-top-royalty-free-image-995518546-1564092355.jpg?crop=0.657xw:0.983xh;0.191xw,0&resize=640:*"}
            } else if(i === 7) {
                pushData = {name: "Meat",
                description: "Meat Ingredient Category",
                imageURL: "https://cdn-prod.medicalnewstoday.com/content/images/articles/319/319314/red-meat-and-poultry.jpg"}
            } else if(i === 8) {
                pushData = {name: "Liquid",
                description: "Liquid Ingredient Category",
                imageURL: "https://thumbs.dreamstime.com/z/array-asian-sauces-cooking-oil-other-ingredients-bottles-sale-thailand-close-up-wide-klong-toey-market-139820991.jpg"}
            } else if(i === 9) {
                pushData = {name: "Other",
                description: "Other Ingredient Category",
                imageURL: "https://quattrofoods.co.uk/wp-content/uploads/2017/02/ready-to-use-sauces.jpg"}
            }
            await connection.query(autoCategory, pushData)
        }

        for(var i = 0; i < 6; i++) {
            let autoCategory = `INSERT INTO QuantityUnit SET ?;`
            var pushData;
            if(i === 0) {
                pushData = {name: "mm"}
            } else if(i === 1) {
                pushData = {name: "ml"}
            } else if(i === 2) {
                pushData = {name: "g"}
            } else if(i === 3) {
                pushData = {name: "kg"}
            } else if(i === 4) {
                pushData = {name: "oz"}
            } else if(i === 5) {
                pushData = {name: "unit"}
            }
            await connection.query(autoCategory, pushData)
        }

        fs.mkdirSync(`./public`);
        fs.mkdirSync(`./public/upload/`);
        return {message:"created successfully"}; 
    } catch (error) {
        console.log(error);
    }
};