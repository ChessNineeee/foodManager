/**
 * 该模块提供一个将时间戳转换为八位字符串的函数，函数的参数为10位时间戳
 */
module.exports = function(timestamp){
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

    Y = date.getFullYear() + '';

    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);

    D = date.getDate();

    return (Y + M + D);
};