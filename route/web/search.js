const express = require('express');
const multer  = require('multer'); // 文件上传中间件
const fs = require('fs'); // 文件读写模块
const AipImageClassifyClient = require("baidu-aip-sdk").imageClassify;
// 设置APPID/AK/SK
const APP_ID = "17841523";
const API_KEY = "gK74AWWY16qv3l1pFdFiopGx";
const SECRET_KEY = "Ivif4KYdF8m5YM1LfTpy8xXSVn6wSzDw";

// 新建一个对象，建议只保存一个对象调用服务接口
const client = new AipImageClassifyClient(APP_ID, API_KEY, SECRET_KEY);
const uploadFolder = './static/upload/'; // 文件上传路径

/**
 * 处理菜品识别请求
 * 前台发送POST请求
 * enctype属性值为multiform-data
 * 上传待识别图片
 * 后台返回识别结果字符串
 * 其中src_path为上传图片路径
 * calory为食物每100克所含卡路里
 * name为识别食物名字
 * 
 */
module.exports=function(){
    var router = express.Router();

    var filename = '';

    // 通过 filename 属性定制
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
        },
        filename: function (req, file, cb) {
            // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
            filename = file.fieldname + '-' + Date.now() + '.jpg';
            cb(null, filename);  
        }
    });

    var upload = multer({storage: storage}); // 控制文件上传的multer对象

    // 单图上传
    router.post('/search', upload.single('logo'), (req, res)=>{
        console.log(123);
        // console.log(req.file);
        var image = fs.readFileSync(uploadFolder+filename).toString("base64"); // 读取用户上传的图片
        // 调用菜品识别
        client.dishDetect(image).then(function(result) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); //设置编码格式，防止乱码
            // console.log(JSON.stringify(result));
            var temp = result.result[0]; // 获取识别的结果

            var back = {}; // 构建返回结果
            
            back.calory = temp.calorie;
            back.name = temp.name;
            back.src_path = 'upload/' + filename;
            console.log(back);
            res.end(JSON.stringify(back)); // end方法中只能返回字符串或buffer 返回结果
        }).catch(function(err) {
        // 如果发生网络错误
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            console.log(err);
            res.end(err.toString());
        });
    });    
    return router;
};