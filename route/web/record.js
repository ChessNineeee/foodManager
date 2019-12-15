const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const mysql = require('mysql');

//创建数据库连接池
var db = mysql.createPool({host: 'localhost', user: 'root', password: '123456', database: 'managerdb'});

module.exports=function(){
    var router = express.Router();
    /**
     * 处理前台查询今日记录详情的请求
     * 前台输入
     * 1.用户id:id
     * 后台返回
     * 1.结果数组result:
     * 其中除了最后一个字符串：
     * type：表示此条食物信息所属记录的类型
     * calory:表示此条食物信息对应的总卡路里=食物每100g卡路里 * 食物摄入量
     * src_path：表示此条食物信息的缩略图在服务器上存储的相对路径
     * name: 表示食物名称
     * ID：表示该食物对应的ID
     * 最后一个json字符串:
     * total_calory：该用户今日摄入的所有卡路里
     */
    router.get('/records', (req, res, next)=>{
        var query = req.query;
        var user_id = query.id; // 前台传来的用户id
        // 对数据库进行查询
        db.query(`SELECT record_time, record.type, food.src_path, food.name, food.ID, food.calory, record_has.food_num \ 
        FROM record JOIN record_has ON ID = record_has.record_id JOIN food ON record_has.food_id = food.ID \
         WHERE record.recorder='${user_id}'`, (err, data)=>{
            if(err){
                // 查询错误
                console.error(err);
                res.status(500).send('database error').end();
            }else if(data.length==0){
                // 未查询到记录，返回空数组
                var result = [];
                res.send(result).end();
            }else{
                var result = [];
                var total_calory = 0;
                for(var i = 0;i < data.length; i++){
                    var temp = {};
                    // 当日期为同一天时将该记录进行处理
                    //其中 require('../../libs/timestamp')(data[i].record_time)对时间戳进行日期转换
                    if(parseInt(require('../../libs/timestampToDate')(data[i].record_time)) == parseInt(require('../../libs/date'))){
                        temp.type = data[i].type;  // 食物所属于的记录的类型，用于判断将食物显示在哪条记录下
                        temp.calory = data[i].calory * data[i].food_num; // 该食物的总卡路里数，用于显示
                        temp.src_path = data[i].src_path; // 食物缩略图在服务器上的相对路径，用于显示
                        temp.name = data[i].name; // 食物的名称，用于显示
                        temp.ID = data[i].ID; // 食物的ID，用于显示详细信息
                        total_calory += temp.calory; //计算该日期内摄入的所有卡路里
                        result.push(temp);
                    }
                }
                var calory = {};
                calory.total_calory = total_calory;
                result.push(calory);
                res.send(result).end(); //返回查询结果
            }
        });
    });
    /**
     * 向记录中增加食物信息,前台发送post请求
     * 前台发送
     * 1.record_id: 记录对应的编号 1-4
     * 2.user_id：记录人id，即创建该记录的用户id
     * 3.food_id: 本条记录对应添加的食品id
     * 4.food_num: 该食物被添加的数目
     * 后台进行以下操作：
     * 1. 判断是否需要新增record，如需要则新增一条record记录
     * 2. 向record_has表中新增一条记录
     * 3. 更新对应record的total_calory属性
     */
    router.post('/records', urlencodedParser, (req, res, next)=>{
        var body = req.body;
        var table_id = body.record_id; // 记录的编号，同时也是记录的类型 1-4
        var recorder_id = body.user_id; // 记录人的id
        var time = parseInt((new Date()).getTime() / 1000); // 当前的10位时间戳，向数据库中新增记录信息时使用
        var food_id = body.food_id; // 食品的id
        var food_num = body.food_num; // 摄入食品的数目
        var record_id = parseInt(require('../../libs/date') + table_id); // 数据库记录表中记录的ID 用八位字符串+记录的编号组合而成

        
        // TODO 画出这两个方法的流程图
        // 本query用于判断是否需要向数据库中新增记录
        db.query(`SELECT * FROM record WHERE ID = ${record_id} AND recorder = ${recorder_id}`, (err, data)=>{
            if(err){
                console.error(err);
                res.status(500).send('database error').end(); 
            }else if(data.length == 0){
                // 输入记录主键发现未查询到结果，此时应该向数据库中新增一条记录
                db.query(`INSERT INTO record (ID, recorder, record_time, type, total_calory) VALUE('${record_id}', '${recorder_id}', '${time}', '${table_id}', '${0}')`, (err, data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }
                });
            }
        });
        // 本query用于向数据库中新增一条record_has的记录
        db.query(`INSERT INTO record_has (record_id, recorder, food_id, food_num) VALUE(${record_id}, ${recorder_id}, ${food_id}, ${food_num})`, (err, data)=>{
            if(err){
              console.error(err);
              res.status(500).send('database error').end();
            }else{
                console.log('insert successfully');
                // 当新增成功后，需要获得该食物的卡路里信息以便更新记录的total_calory属性
                db.query(`SELECT calory FROM food WHERE ID = ${food_id}`, (err, data)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('database error').end();
                    }else{
                        // 由于链式操作，向req对象中赋值
                        req.record_id = record_id; // 记录的id
                        req.recorder_id = recorder_id; // 记录人的id
                        req.calory = data[0].calory; // 该食物的卡路里信息
                        next();
                    }
                });
            }
          });
        
    });

    router.post('/records', urlencodedParser, (req, res)=>{
        // 接受上一个链式操作传来的数据
        var record_id = req.record_id;
        var recorder_id = req.recorder_id;
        var calory = req.calory;
        
        //本query用于更新record表中对应的记录的total_calory属性
        db.query(`UPDATE record SET total_calory = (total_calory +'${calory}') WHERE \
        ID = '${record_id}' AND recorder = '${recorder_id}' `, (err, data)=>{
            if(err){
                console.log(err);
                res.status(500).send('database error').end();
            }else{
                //更新成功
                console.log('update successfully');
                res.status(200).send('success').end();
            }
        });
    });

    return router;
};