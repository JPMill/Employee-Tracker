const inquirer = require('inquirer');
const db = require('./db/connection');
const consoleTable = require('console.table');

// Main menu function
async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'View all departments':
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      db.end();
      console.log('Goodbye!');
      return;
  }

  mainMenu();
}

// View all departments
async function viewDepartments() {
  const { rows } = await db.query('SELECT * FROM departments');
  console.table(rows);
}

// View all roles
async function viewRoles() {
  const { rows } = await db.query(`
    SELECT roles.id, roles.title, roles.salary, departments.name AS department
    FROM roles
    JOIN departments ON roles.department_id = departments.id;
  `);
  console.table(rows);
}

// View all employees
async function viewEmployees() {
  const { rows } = await db.query(`
    SELECT employees.id, employees.first_name, employees.last_name, roles.title AS role,
           roles.salary, departments.name AS department, 
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id;
  `);
  console.table(rows);
}

// Add a department
async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new department:',
    },
  ]);

  await db.query('INSERT INTO departments (name) VALUES ($1)', [name]);
  console.log(`Added department: ${name}`);
}

// Add a role
async function addRole() {
  const departments = await db.query('SELECT * FROM departments');
  const { name, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for this role:',
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for this role:',
      choices: departments.rows.map((department) => ({
        name: department.name,
        value: department.id,
      })),
    },
  ]);

  await db.query(
    'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
    [name, salary, department_id]
  );
  console.log(`Added role: ${name}`);
}

// Add an employee
async function addEmployee() {
  const roles = await db.query('SELECT * FROM roles');
  const employees = await db.query('SELECT * FROM employees');
  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "Enter the employee's first name:",
    },
    {
      type: 'input',
      name: 'last_name',
      message: "Enter the employee's last name:",
    },
    {
      type: 'list',
      name: 'role_id',
      message: "Select the employee's role:",
      choices: roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
    {
      type: 'list',
      name: 'manager_id',
      message: "Select the employee's manager:",
      choices: [
        { name: 'None', value: null },
        ...employees.rows.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      ],
    },
  ]);

  await db.query(
    'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first_name, last_name, role_id, manager_id]
  );
  console.log(`Added employee: ${first_name} ${last_name}`);
}

// Update an employee role
async function updateEmployeeRole() {
  const employees = await db.query('SELECT * FROM employees');
  const roles = await db.query('SELECT * FROM roles');
  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee to update:',
      choices: employees.rows.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      })),
    },
    {
      type: 'list',
      name: 'role_id',
      message: "Select the employee's new role:",
      choices: roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
  ]);

  await db.query('UPDATE employees SET role_id = $1 WHERE id = $2', [
    role_id,
    employee_id,
  ]);
  console.log('Updated employee role.');
}

mainMenu();