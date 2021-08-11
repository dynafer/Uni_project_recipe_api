var mysql = require('promise-mysql');
var info = require('../config');
var passwordHash = require('password-hash');

exports.authenticateLogin = async (logInfo) => {
    try {
        const connection = await mysql.createConnection(info.config);
        let sql = `SELECT * FROM users WHERE username = ?`;
        let data = await connection.query(sql, logInfo.username);
        let res = {success: false, userid: 0, username: null};
        if(data.length == 0) return res;
        if(data[0].password != "" && passwordHash.verify(logInfo.password, data[0].password)) {
            res.userid = data[0].id;
            res.username = data[0].username;
            res.success = true;
        }
        await connection.end();
        return res;
    } catch (error) {
        console.log(error);
    }
};