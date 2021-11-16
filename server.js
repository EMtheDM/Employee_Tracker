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

const questions = () => {
    inquirer
        .prompt([
            {
                name: "choices",
                type: "list",
                message: "What would you like to do?",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a deparment",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role"
                ],
            },
        ])
        .then((answers) => {
            const { choices } = answers;
            if (choices == "View all departments") {
                loadDepts();
            } else if (choices == "View all roles") {
                loadRoles();
            } else if (choices == "View all employees") {
                loadEmployees();
            } else if (choices == "Add a department") {
                addDept();
            } else if (choices == "Add a role") {
                addRole();
            } else if (choices == "Add an employee") {
                addEmployee();
            } else {
                updateEmployeeRole();
            };
        });
};

const loadDepts = () => {
    db.query(
        `SELECT * FROM department`, 
        function (err, result) {
            console.table(result);
            questions();
    });
};

const loadRoles = () => {
    db.query(
        `SELECT roles.id, roles.title, roles.salary, department.name 
        FROM roles 
        JOIN deparment on roles.department_id = department.id`,
        function (err, result) {
            console.table(result);
            questions();
    });
};

const loadEmployees = () => {
    db.query(
        `SELECT employee.first_name, employee.last_name, employee.manager_id, roles.title, roles.salary, department.name 
        FROM employee
        JOIN roles ON roles.id = employee.role_id
        JOIN department ON department.id = roles.department_id`,
        function (err, result) {
            console.table(result);
            questions();
    });
};

const addDept = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "What is the name of the new department?"
            },
        ])
        .then((response) => {
        const { name } = response;
        db.query(
            `INSERT INTO department (name) VALUES (?)`,
            name,
            (err, result) => {
                if (err) throw err;
                console.log("New department added!");
                questions();
            }
        );
    });
};

