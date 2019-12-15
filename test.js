// var fs = require('fs');
// var AipImageClassifyClient = require("baidu-aip-sdk").imageClassify;

// // 设置APPID/AK/SK
// var APP_ID = "17841523";
// var API_KEY = "gK74AWWY16qv3l1pFdFiopGx";
// var SECRET_KEY = "Ivif4KYdF8m5YM1LfTpy8xXSVn6wSzDw";

// // 新建一个对象，建议只保存一个对象调用服务接口
// var client = new AipImageClassifyClient(APP_ID, API_KEY, SECRET_KEY);

// var express = require('express');
// var multer  = require('multer');

// var app = express();

// var uploadFolder = './static/upload/';

// var filename = '';

// // 通过 filename 属性定制
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
//     },
//     filename: function (req, file, cb) {
//         // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
//         filename = file.fieldname + '-' + Date.now() + '.jpg';
//         cb(null, filename);  
//     }
// });
// var upload = multer({storage: storage});

// // 单图上传
// app.post('/upload', upload.single('logo'), function(req, res, next){
//     // console.log(req.file);
//     var image = fs.readFileSync("./static/upload/"+filename).toString("base64");
//     // 调用菜品识别
//     client.dishDetect(image).then(function(result) {
//         res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); //设置编码格式，防止乱码
//         console.log(JSON.stringify(result));
//         res.end(JSON.stringify(result));
//     }).catch(function(err) {
//     // 如果发生网络错误
//         res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
//         console.log(err);
//         res.end(err.toString());
//     });
// });


// app.listen(8080);

var timestamp = (new Date()).getTime();
console.log(timestamp);
// var date = new Date(timestamp);
// date.getFullYear();
// console.log(timestamp);
