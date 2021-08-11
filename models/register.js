var mysql = require('promise-mysql');
var info = require('../config');
var passwordHash = require('password-hash');

exports.checkRegister = async (checkInfo) => {
    try {
        let ret = {err: false, succ: false, err_text: ""}
        if(checkInfo.username.length === 0 || checkInfo.username === undefined) { ret.err = true; ret.err_text = "Missing username"; return ret; }
        if(checkInfo.password.length === 0 || checkInfo.username === undefined) { ret.err = true; ret.err_text = "Missing password"; return ret; }

        const connection = await mysql.createConnection(info.config);
        let sql = `SELECT * FROM users
                WHERE username = ?
                `;
        let data = await connection.query(sql, checkInfo.username);
        if(data.length == 0) {
            let sql = `INSERT INTO users SET ?`;
            await connection.query(sql, {username: checkInfo.username, password: passwordHash.generate(checkInfo.password)});
            ret.succ = true;
        } else {
            ret.err = true;
            ret.err_text = "The entered username is already taken";
        }
        return ret;
    } catch (error) {
        console.log(error);
    }
};