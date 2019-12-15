/**
 * 该模块用于获取当前日期的八位字符串 如20190101
 */
var date = new Date();
var year = date.getFullYear()+'';
var month = (date.getMonth() + 1 < 10 ? '0' + date.getMonth() + 1 : date.getMonth() + 1);
var day = date.getDate();

module.exports = (year + month + day); 