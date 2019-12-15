const express = require('express');
const mysql = require('mysql');

//创建数据库连接池
var db = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'managerdb'});

module.exports=function(){
    var router = express.Router();
    /**
     * TODO:修改本api的url
     * 前台输入
     * 1. 食品种类：type
     * 2. 查询页数：page
     * 后台返回
     * 1.结果数组result：
     * 其中每个字符串中：
     * id: 食品的id，用于查看食物详情时发送请求
     * name: 食品的名称
     * calory: 食品的卡路里含量
     * src_path: 食品缩略图的相对路径
     * 
     */
    router.get('/foods', (req, res, next)=>{
        var query = req.query;
        var type = query.type; // 食品的种类
        var page = query.page - 1; // 加载第page页，每页显示10条食品简介
        var id = query.id; // 判断是否是查询食物详情的请求
        console.log(id != undefined);
        if(id != undefined){
            // 请求为查询食物详情，进行链式操作
            req.id = id;
            next();
        }else{
            console.log(page);
            db.query(`SELECT ID, name, calory, src_path FROM food WHERE type=${type} ORDER BY calory LIMIT ${page * 10}, 10 `, (err, data)=>{
            if(err){
                // 查询错误
                console.error(err);
                res.status(500).send('database error').end();
            }else if(data.length==0){
                // 未查询到记录，返回空数组
                res.send(data).end();
            }else{
                console.log(data);
                var result = [];
                // 构建结果数组，其中每个结果为食物简介的json字符串
                for(var i = 0;i < data.length; i++){
                    var temp = {};
                    temp.ID = data[i].ID;
                    temp.name = data[i].name;
                    temp.calory = data[i].calory;
                    temp.src_path = data[i].calory;
                    result.push(temp);
                }
                res.send(result).end();
            }
            });
        }
        
        
    });
    /**
     * 处理前台查询食物详情的请求
     * 前台输入
     * 1. 食品ID
     * 后台返回
     * 1.结果字符串：
     * 其中字符串中：
     * name: 食品的名称
     * calory: 食品的卡路里含量
     * protein: 食物的蛋白质含量
     * grease: 食物的脂肪含量
     * carbon: 食物的碳水化合物含量
     * src_path: 食品缩略图的相对路径
     */
    router.use('/foods', (req, res, next)=>{
        var id = req.id;
        db.query(`SELECT name, calory, grease, protein, carbon, src_path FROM food WHERE ID=${id}`, (err, data)=>{
            if(err){
                // 查询错误
                console.error(err);
                res.status(500).send('database error').end();
            }else if(data.length==0){
                // 未查询到记录，返回空数组
                res.send(data).end();
            }else{
                // 根据查询结果封装json字符串返回给前台
                var result = {};
                result.name = data[0].name;
                result.calory = data[0].calory;
                result.protein = data[0].protein;
                result.carbon = data[0].carbon;
                result.grease = data[0].grease;
                result.src_path = data[0].calory;
                
                res.send(result).end();
            }
        });
    });
    /**
     * 处理前台请求食物拥有的重量单位
     * 前台输入
     * 1.食物id
     * 后台返回
     * 1.json字符串result：
     * name：重量单位的名称
     * gram：重量单位的克数
     */
    router.get('/unit-weight', (req, res)=>{
        var food_id = req.query.id;
        db.query(`SELECT name, gram FROM weight_unit NATURAL JOIN food_has WHERE food_has.food_id = ${food_id}`, (err, data)=>{
            if(err){
                // 查询错误
                console.error(err);
                res.status(500).send('database error').end();
            }else if(data.length==0){
                // 未查询到记录，返回空数组
                res.send(data).end();
            }else{
                // 根据查询结果封装json字符串返回给前台
                var result = [];
                // 构建结果数组，其中每个结果为食物简介的json字符串
                for(var i = 0;i < data.length; i++){
                    var temp = {};
                    temp.name = data[i].name;
                    temp.gram = data[i].gram;
                    result.push(temp);
                }
                res.send(result).end();
            }
            });
    });

    return router;
};
