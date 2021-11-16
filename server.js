const inquirer = require("inquirer");
const mysql2 = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employees_db"
});

db.connect((error) => {
    if (error) throw error;
    questions();
});

