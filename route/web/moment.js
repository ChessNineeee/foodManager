const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

// 创建数据库连接池
var db = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'managerdb'});

module.exports=function(){
    var router = express.Router();

    router.get('/moments', (req, res)=>{
        var user_id = req.query.user_id;
        var moment_id = req.query.moment_id;
        var user_type = req.query.user_type;
        var timestamp = parseInt((new Date()).getTime / 1000); 

        switch(req.query.act){
            case 'get-summary':
                db.query(`SELECT moment.ID, title, summary, n_like, cover_src_path, username, src_path FROM moment JOIN user ON author = user.ID`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        //根据查询结果生成返回结果
                        var result = [];
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.ID = data[i].ID; //标签的id
                            temp.title = data[i].title; // 标签的名称
                            temp.summary = data[i].summary; // 标签缩略图的相对路径
                            temp.n_like = data[i].n_like;
                            temp.cover = data[i].cover_src_path;
                            temp.author = data[i].username;
                            temp.avatar = data[i].src_path;
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
            case 'get-detail':
                var result = {};
                db.query(`SELECT summary, post_time, username, src_path FROM moment JOIN user ON author = user.ID WHERE moment.ID = '${moment_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        //根据查询结果生成返回结果
                        var static_data = {};
                        static_data.summary = data[0].summary;
                        static_data.post_time = data[0].post_time;
                        static_data.author = data[0].username;
                        static_data.avatar = data[0].src_path;
                        result.push(static_data);

                        var dynamic_data = [];
                        db.query(`SELECT record.type, food.name, food.src_path FROM moment_from JOIN (record NATURAL JOIN record_has NATURAL JOIN food) ON \
                        record_id = record.ID and user_id WHERE moment_id = ${moment_id} \
                        `, (err, data)=>{
                            if(err){
                                console.error(err);
                                res.status(500).send('database error').end();
                            }else{
                                var temp = {};
                                for(var i = 0; i < data.length; i++){
                                    temp.record_type = data[i].type;
                                    temp.food_name = data[i].name;
                                    temp.food_src_path = data.src_path;
                                    dynamic_data.push(temp);
                                } 
                            }
                        });
                        result.static = static_data;
                        result.dynamic = dynamic_data;
                        res.send(result).end();
                    }
                });
                break;
            case 'collect':
                db.query(`INSERT INTO moment_collection (user_id, moment_id, collect_date) VALUE('${user_id}', '${moment_id}', '${timestamp}')`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        console.log('Insert successfully');
                        res.status(200).send('collect successfully').end();
                    }
                });
                break;
            case 'cancel-collect':
                db.query(`DELETE FROM moment_collection WHERE moment_id = '${moment_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        console.log('Insert successfully');
                        res.status(200).send('cancel successfully').end();
                    }
                });
                break;
            case 'get-collection':
                db.query(`SELECT moment.ID, title, summary, n_like, cover_src_path, username, src_path FROM moment JOIN moment_collection JOIN (user ON user_id = user.ID) ON ID = moment_id WHERE user_id = '${user_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        //根据查询结果生成返回结果
                        var result = [];
                        for(var i = 0;i < data.length; i++){
                            var temp = {};
                            temp.ID = data[i].ID; //标签的id
                            temp.title = data[i].title; // 标签的名称
                            temp.summary = data[i].summary; // 标签缩略图的相对路径
                            temp.n_like = data[i].n_like;
                            temp.cover = data[i].cover_src_path;
                            temp.author = data[i].username;
                            temp.avatar = data[i].src_path;
                            result.push(temp);
                        }
                        res.send(result).end();
                    }
                });
                break;
            default:
                break;               
        }
    });
    router.post('/moments', urlencodedParser, (req, res)=>{
        var user_id = req.body.user_id;
        var moment_id = req.body.moment_id;
        var timestamp = (new Date()).getTime();
        switch(req.body.act){
            case 'like':
                db.query(`SELECT * FROM favourite_moment WHERE user_id = '${user_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else if(data.length == 0){
                        db.query(`UPDATE moment SET n_like = (n_like + 1) WHERE ID = '${moment_id}'`, (err, data)=>{
                            if(err){
                                console.error(err);
                                res.status(500).send('database error').end();
                            }else{
                                db.query(`INSERT INTO favourite_moment(moment_id, user_id) VALUE ('${moment_id}', '${user_id}')`, (err, data)=>{
                                    if(err){
                                        console.error(err);
                                        res.status(500).send('database error').end();
                                    }else{
                                        console.log('insert successfully');
                                        res.status(200).send('success').end();
                                    }
                                });
                            }
                        });
                    }else{
                        console.log('cannot like the moment');
                        res.status(400).send('failed').end();
                    }
                });
                break;
            case 'cancel-like':
                db.query(`SELECT * FROM favourite_moment WHERE user_id = '${user_id}'`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else if(data.length != 0){
                        db.query(`UPDATE moment SET n_like = (n_like - 1) WHERE ID = '${moment_id}'`, (err, data)=>{
                            if(err){
                                console.error(err);
                                res.status(500).send('database error').end();
                            }else{
                                db.query(`DELETE FROM favourite_moment WHERE moment_id = '${moment_id}' AND user_id = '${user_id}'`, (err, data)=>{
                                    if(err){
                                        console.error(err);
                                        res.status(500).send('database error').end();
                                    }else{
                                        console.log('delete successfully');
                                        res.status(200).send('success').end();
                                    }
                                });
                            }
                        });
                    }else{
                        console.log('cannot cancel the moment');
                        res.status(400).send('failed').end();
                    }
                });
                break;
            case 'publish':
                var title = req.body.title;
                var summary = req.body.summary;
                var user_id = req.body.author;
                var timestamp = parseInt((new Date()).getTime() / 1000);
                var n_like = 0;
                var cover_src_path = req.body.cover_src_path;
                var record_ids = req.body.record_ids;
                var record_id_array = record_ids.split('_');

                db.query(`INSERT INTO MOMENT(title, summary, author, post_time, n_like, cover_src_path) VALUE('${title}', '${summary}', '${user_id}', '${timestamp}', '${n_like}', '${cover_src_path}')`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else{
                        db.query(`SELECT LAST_INSERT_ID()`, (err, data)=>{
                            if(err){
                                console.error(err);
                                res.status(500).send('database error').end();
                            }else{
                                var moment_id = data[0]['LAST_INSERT_ID()'];
                                for(var i = 0; i < record_id_array.length; i++){
                                    db.query(`INSERT INTO moment_from(moment_id, record_id, user_id) VALUE('${moment_id}', '${record_id_array[i]}', '${user_id}')`, (err, data)=>{
                                        if(err){
                                            console.error(err);
                                            res.status(500).send('database error').end();
                                        }else{
                                            console.log('insert successfully');
                                            res.status(200).send('success').end();
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
                break;
            default:
                break;
        }
    });
    return router;
}