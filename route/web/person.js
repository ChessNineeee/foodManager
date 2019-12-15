const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});


//创建数据库连接池
var db = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'managerdb'});
module.exports = function(){
    var router = express.Router();
    /**
     * 用于处理标签相关的请求
     * 前台输入
     * 1. 对标签执行的行为：get 查询 del 删除
     * 2. 用户的id
     * 3. 标签的id 可包含多条标签id，删除用户拥有的标签时支持批量删除
     * 后台返回
     * 1. 查询结果字符串包括
     *  ————按用户id查询的标签信息
     *  ————所有的标签信息
     * 2. 删除标签拥有信息结果字符串
     */
    router.get('/labels', (req, res, next)=>{
        var user_id = req.query.user_id; // 用户的id
        switch(req.query.act){
            // 通过用户id查询标签信息
            case 'get':
                db.query(`SELECT ID, name, src_path FROM users_own JOIN label ON label_id = ID WHERE user_id = '${user_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error');
                    }else{
                        //根据查询结果生成返回结果
                        var result = [];
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.ID = data[i].ID; //标签的id
                            temp.name = data[i].name; // 标签的名称
                            temp.src_path = data[i].src_path; // 标签缩略图的相对路径
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
            case 'del':
                // var user_id = req.query.user_id;
                var label_ids = req.query.label_ids; // 需要删除的标签id字符串，可以包括多条标签id
                var label_id_array = label_ids.split('_'); // 将字符串进行拆分，得到需要删除的id数组
                var success = true;
                for(var i = 0; i < label_id_array.length; i++){
                    var label_id = label_id_array[i];
                    // 执行users_own表的删除操作
                    db.query(`DELETE FROM users_own WHERE user_id = '${user_id}' AND label_id = ${label_id}`, (err, data)=>{
                        if(err){
                            console.error(err);
                            success = false;
                        }else{
                            // 返回删除结果
                            console.log('delete successfully');
                        }
                    });
                }
                if(success){
                    res.status(200).send('delete successfully').end();
                }else{
                    res.status(500).send('database error').end();
                }
                break;
            // 默认查询所有的标签详细信息
            default:
                db.query(`SELECT * FROM label`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        //根据查询结果生成返回结果
                        var result = [];
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.ID = data[i].ID; //标签的id
                            temp.name = data[i].name; // 标签的名称
                            temp.src_path = data[i].src_path; // 标签缩略图的相对路径
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;    
        }
    });
    /**
     * 处理新增用户拥有标签信息的请求
     * 前台输入
     * 1. 用户id
     * 2. 待删除的标签id字符串，删除标签信息时支持批量删除
     * 后台返回
     * 1. 删除结果
     */
    router.post('/labels', urlencodedParser, (req, res)=>{
        var body = req.body;
        var user_id = body.user_id; // 用户id
        var label_ids = body.label_ids; // 标签id字符串
        var label_id_array = label_ids.split('_'); // 将标签id字符串进行拆分，得到需要删除的标签id数组
        var success = true;
        //for循环用于批量删除
        for(var i = 0; i < label_id_array.length; i++){
            var label_id = label_id_array[i]; //获取待删除标签id
            db.query(`INSERT INTO users_own (user_id, label_id) VALUE('${user_id}', '${label_id}')`, (err, data)=>{
                if(err){
                    console.error(err);
                    success = false;
                }else{
                    console.log('Insert successfully');
                }   
            });
        }
        if(success){
            res.status(200).send('insert successfully').end();
        }else{
            res.status(500).send('database error').end();
        }
    });
    /**
     * 处理与用户类别有关的的请求
     * 前台输入
     * 1. 对类型执行的行为：get 查询特定类型信息 default 所有类型的详细信息
     * 2. 用户id：用于查询特定的类型信息
     * 后台返回
     * 1. 查询到的类型详细信息组成的json字符串
     * 其中 ID 表示类型的ID
     * name 表示类型的名称
     * src_path 表示类型的图片的相关路径
     */
    router.get('/types', (req, res)=>{
        var user_id = req.query.user_id;
        switch(req.query.act){
            // 查询特定的类型详细信息
            case 'get':
                db.query(`SELECT type.ID, name, type.src_path FROM user JOIN type ON type = type.ID WHERE user.ID = '${user_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        // 根据查询结果生成返回结果
                        var result = [];
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.ID = data[i].ID; // 类型的id
                            temp.name = data[i].name; // 类型的名称
                            temp.src_path = data[i].src_path; // 类型图片的src_path
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
            default:
                // 查询所有类型的详细信息
                db.query(`SELECT * FROM type`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        var result = [];
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.ID = data[i].ID;
                            temp.name = data[i].name;
                            temp.src_path = data[i].src_path;
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
        }
    });
    /**
     * 处理更新用户所属类型的请求
     * 前台输入：
     * 1. user_id 用户的id
     * 2. type_id 用户类型的id
     */
    router.post('/types', urlencodedParser, (req, res)=>{
        var user_id = req.body.user_id; // 用户id
        var type_id = req.body.type_id; // 用户类型id
        // 健壮性测试
        if(!user_id || !type_id){
            res.status(400).send('arg error').end();
        }else{
            // 更新特定用户的类型信息
            db.query(`UPDATE user SET type = '${type_id}' WHERE ID = '${user_id}'`, (err, data)=>{
                if(err){
                    console.error(err);
                    res.status(500).send('database error').end();
                }else {
                    // 返回更新结果
                    res.status(200).send('update successfully').end();
                }
            });
        }
    });
    return router;
};