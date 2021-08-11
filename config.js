exports.config = {
    /*
    //Heroku Server
    host: process.env.DB_HOST || "eu-cdbr-west-02.cleardb.net",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "b049ed68ec0bb8",
    password: process.env.DB_PASSWORD || "cba0a5ec",
    database: process.env.DB_DATABASE || "heroku_c256aa749a3072b",
    connectionLimit: 100
    */
   
    // Local Server
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || "recipe",
    connectionLimit: 100
};