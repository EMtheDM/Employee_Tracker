const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");
const table = require("console.table");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employees_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to employee database");
  questions();
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
                    "Add a department",
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
        "SELECT * FROM departments", 
        function (err, result) {
            console.table(result);
            questions();
    });
};

const loadRoles = () => {
    db.query(
        `SELECT * FROM roles`,
        function (err, result) {
            console.table(result);
            questions();
    });
};

const loadEmployees = () => {
    db.query(
        `SELECT employees.id, 
        employees.first_name, 
        employees.last_name, 
        employees.manager_id, 
        roles.title, 
        roles.salary, 
        departments.name 
        FROM employees
        JOIN roles ON roles.id = employees.role_id
        JOIN departments ON departments.id = roles.department_id`,
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
        message: "What is the name of the new department?",
      },
    ])
    .then((response) => {
      const { name } = response;
      db.query(
        `INSERT INTO departments (name) VALUES (?)`,
        name,
        (err, result) => {
          if (err) throw err;
          console.log("New department added");
          questions();
        }
      );
    });
};

const addRole = () => {
  db.query("SELECT * FROM departments", function (err, result) {
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the new role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of the new role?",
        },
        {
          type: "list",
          name: "dept",
          message: "What department is the new role located?",
          choices: result.map((item) => ({
            name: item.name,
            value: item.id,
          })),
        },
      ])
      .then((response) => {
        const { title, salary, dept } = response;
        db.query(
          `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`,
          [title, salary, dept],
          (err, result) => {
            if (err) throw err;
            questions();
          }
        );
      });
  });
};

  const addEmployee = () => {
    db.query("SELECT * FROM roles", function (err, result) {
      inquirer
        .prompt([
          {
            type: "input",
            name: "first",
            message: "first name?",
          },
          {
            type: "input",
            name: "last",
            message: "last name?",
          },
          {
            type: "list",
            name: "role",
            message: "What is the employee's role?",
            choices: result.map((item) => ({
              name: item.title,
              value: item.id,
            })),
          },
        ])
        .then((response) => {
          const { first, last, role } = response;
          db.query(
            `INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?)`,
            [first, last, role],
            questions(),
            (err, result) => {
              if (err) throw err;
            }
          );
        });
    });
  };

  const updateEmployeeRole = () => {
    inquirer.prompt([{
          name: "id",
          type: "input",
          message: "What is the Employee ID of the employee you wish to update?",
        },
        {
          name: "roleId",
          type: "input",
          message: "What is the new Role ID of the employee?",
        },
      ])
      .then(answer => {
        db.query(
          "UPDATE employees SET role_id=? WHERE id=?",
          [answer.roleId, answer.id],
          function (err, res) {
            if (err) throw err;
            console.log("Employee position has been updated in the database.");
            questions();
          }
        );
      });
  };