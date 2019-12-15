const express=require('express');
const static=require('express-static');

const cookieParser=require('cookie-parser');
const cookieSession=require('cookie-session');


var server = express();
server.listen(8080);

//1. 获取前台请求数据
//处理POST请求数据
// server.use(bodyParser.urlencoded());
// server.use(multerObj.any());

//2.cookie、session
server.use(cookieParser());
(function (){
  var keys=[];
  for(var i=0;i<100000;i++){
    keys[i]='a_'+Math.random();
  }
  //给session加密
  server.use(cookieSession({
    name: 'sess_id',
    keys: keys,
    maxAge: 20*60*1000  //20min
  }));
})();

//4.route
//其中每一个路由导出的为function，必须要调用
server.use('/index', require('./route/web/index')()) 
server.use('/search', require('./route/web/search')());
server.use('/food', require('./route/web/food')());
server.use('/record', require('./route/web/record')());
server.use('/person', require('./route/web/person')());



//5.default：static 访问静态资源(图片)
server.use(static('./static/'));

