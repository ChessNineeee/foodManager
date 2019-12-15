const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const multer  = require('multer'); // 文件上传中间件
const fs = require('fs'); // 文件读写模块
const uploadFolder = './'; // 文件上传路径

//创建数据库连接池
var db = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'managerdb'});
module.exports = function(){
    var router = express.Router();

    // 通过 filename 属性定制
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
        },
        filename: function (req, file, cb) {
            // 将保存文件名设置为 字段名 + 用户id + 时间戳，比如 avatar-1-1478521468943
            filename = file.fieldname + '-' + req.body.user_id + '-' + Date.now() + '.jpg';
            cb(null, filename);  
        }
    });
    var upload = multer({storage: storage}); // 控制文件上传的multer对象


        
    router.get('/myinfo', (req, res)=>{
        var user_id = req.query.user_id;
        switch(req.query.act){
            case 'get-part':
                db.query(`SELECT name, src_path FROM user WHERE ID = '${user_id}'`, (err, data)=>{
                    if(err){
                        // 查询错误
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        var result = [];
                        // 构建结果数组，其中每个结果为用户简介的json字符串
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.name = data[i].name;
                            temp.src_path = data[i].calory;
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
            case 'get-all':
                db.query(`SELECT name, src_path, calory_limit FROM user WHERE ID = '${user_id}'`, (err, data)=>{
                    if(err){
                        // 查询错误
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        var result = [];
                        // 构建结果数组，其中每个结果为用户简介的json字符串
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.name = data[i].name; // 用户名
                            temp.src_path = data[i].src_path; // 用户头像的相对路径
                            temp.calory_limit = data[i].calory_limit; // 用户设定的卡路里限制
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
            case 'update-name':
                var new_name = req.query.name; // 新用户名
                db.query(`UPDATE user SET name = '${new_name}' WHERE ID = '${user_id}`, (err, data)=>{
                    if(err){
                        // 查询错误
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        //更新成功
                        console.log('update successfully');
                        res.status(200).send('success').end();
                    }
                });
                break;
            case 'update-calory':
                var new_limit = req.query.limit; // 新设定的卡路里
                db.query(`UPDATE user SET calory_limit = '${new_limit}' WHERE ID = '${user_id}`, (err, data)=>{
                    if(err){
                        // 查询错误
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        //更新成功
                        console.log('update successfully');
                        res.status(200).send('success').end();
                    }
                });
                break;
            default:
                break;
        }
    });
    router.post('/myinfo', upload.single('avatar'), (req, res)=>{
        switch(req.query.act){
            case 'update-avatar':
                var user_id = req.body.user_id;
                var new_path = uploadFolder+filename;
                db.query(`UPDATE user SET src_path = '${new_path}' WHERE ID = '${user_id}`, (err, data)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('database error').end();
                    }else{
                        //更新成功
                        console.log('update successfully');
                        res.status(200).send('success').end();
                    }
                });
                break;
            default:
                break; 
        }
    });
    return router;
}