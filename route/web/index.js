const express = require('express');
const mysql = require('mysql');

//创建数据库连接池
var db = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'managerdb'});

module.exports=function(){
    var router = express.Router();
    /**
     * 处理前台查询今日记录的请求
     * 前台输入
     * 1.用户id:id
     * 2.时间戳:time
     * 后台返回
     * 1.结果数组result:
     *  其中每个字符串中:
     *  type: 表示记录的类型，1为早餐记录，2为午餐记录，3为晚餐记录，4为加餐记录
     *  calory:表示本记录所摄入的卡路里，单位为千卡
     */
    router.get('/records', (req, res)=>{
        var query = req.query;
        var user_id = query.id; // 前台传来的用户id
        var time = query.time; // 前台传来的时间戳
        // 根据用户id查询数据库中的饮食记录
        db.query(`SELECT record_time, type, total_calory FROM record WHERE recorder=${user_id}`, (err, data)=>{
            if(err){
                // 查询错误
                console.error(err);
                res.status(500).send('database error').end();
            }else if(data.length==0){
                // 未查询到记录，返回空数组
                res.send(data).end();
            }else{
                var result = [];
                for(var i = 0;i < data.length; i++){
                    var temp = {};
                    // 当日期为同一天时将记录加入返回结果数组
                    if(parseInt(data[i].record_time / 1000) == parseInt(time / 1000)){
                        temp.type = data[i].type;  // 记录的类型
                        temp.calory = data[i].total_calory; // 记录对应的总卡路里数
                        result.push(temp);
                    }
                }
                res.send(result).end();
            }
        });

    });
    /**
     * 处理首页查询有关文章的请求
     * 前台输入
     * 1.用户类型：type
     * 后台返回
     * 1.结果数组result:
     *  其中每个字符串中:
     *  id: 本篇文章的id，用于查看更多时发送请求
     *  title: 文章的标题
     *  summary: 文章的简介
     *  cover_src: 封面的url，用于显示封面图片
     */
    router.get('/articles', (req, res)=>{
        var query = req.query; // 获取url中请求参数
        var type = query.type; // 获取用户的类型
        //TODO:将文章类型与用户类型与用户标签联系起来
        db.query(`SELECT ID, title, summary, cover_src FROM article WHERE author=${type}`, (err, data)=>{
            if(err){
                // 查询错误
                console.error(err);
                res.status(500).end('database error');
            }else if(data.length == 0){
                // 未查询到记录，返回空数组
                res.send(data).end();
            }else{
                // TODO 将文章数据与用户类型与用户标签联系起来
                result = [];
                for(var i = 0;i < data.length; i++){
                    var temp = {};
                    temp.id = data[i].ID;
                    temp.title = data[i].title;
                    temp.summary = data[i].summary;
                    temp.cover_src = data[i].cover_src;
                    result.push(temp);
                }
                res.send(result).end();
            }
        });

    });

    return router;
}