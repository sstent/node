var mysql = require('mysql');
var MYSQL_USERNAME = 'root';
var MYSQL_PASSWORD = 'condoms';

// init;
var client = mysql.createClient({
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
});

// destroy old db
//client.query('DROP DATABASE IF EXISTS mynode_db', function(err) {
//  if (err) { throw err; }
//});

// create database
//client.query('CREATE DATABASE mynode_db', function(err) {
//  if (err) { throw err; }
//});
//console.log('database mynode_db is created.');
client.query('USE mynode_db');

// create table
var sql = ""+
"create table employees("+
" id int unsigned not null auto_increment,"+
" name varchar(50) not null default 'unknown',"+
" salary dec(10,2) not null default 100000.00,"+
" primary key (id)"+
");";
//client.query(sql, function(err) {
//  if (err) { throw err; }
//});
//console.log('table employees is created.');

// function to create employee
exports.add_employee = function(data, callback) {
 client.query("insert into employees (name, salary) values (?,?)", [data.name, data.salary], function(err, info) {
    // callback function returns last insert id
    callback(info.insertId);
    console.log('Employee '+data.name+' has salary '+data.salary); 
  });
}

// function to get list of employees
exports.get_employees = function(callback) {
  client.query("select * from employees", function(err, results, fields) {
    // callback function returns employees array
    callback(results);
  });
}
