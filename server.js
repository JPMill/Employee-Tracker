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
        'View employees by department',
        'Delete a department',
        'Delete a role',
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
    case 'View employees by department':
      await viewEmployeesByDepartment();
      break;
    case 'Delete a department':
      await deleteDepartment();
      break;
    case 'Delete a role':
      await deleteRole();
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
  const { rows } = await db.query('SELECT * FROM department');
  console.table(rows);
}

// View all roles
async function viewRoles() {
  const { rows } = await db.query(`
    SELECT roles.id, roles.title, roles.salary, department.name AS department
    FROM role AS roles
    JOIN department ON roles.department_id = department.id;
  `);
  console.table(rows);
}

// View all employees
async function viewEmployees() {
  const { rows } = await db.query(`
    SELECT employees.id, employees.first_name, employees.last_name, roles.title AS role,
           roles.salary, department.name AS department, 
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee AS employees
    JOIN role AS roles ON employees.role_id = roles.id
    JOIN department ON roles.department_id = department.id
    LEFT JOIN employee AS manager ON employees.manager_id = manager.id;
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

  await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added department: ${name}`);
}

// Add a role
async function addRole() {
  const departments = await db.query('SELECT * FROM department');
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
    'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
    [name, salary, department_id]
  );
  console.log(`Added role: ${name}`);
}

// Add an employee
async function addEmployee() {
  const roles = await db.query('SELECT * FROM role');
  const employees = await db.query('SELECT * FROM employee');
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
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first_name, last_name, role_id, manager_id]
  );
  console.log(`Added employee: ${first_name} ${last_name}`);
}

// Update an employee role
async function updateEmployeeRole() {
  const employees = await db.query('SELECT * FROM employee');
  const roles = await db.query('SELECT * FROM role');
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

  

  await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [
    role_id,
    employee_id,
  ]);
  console.log('Updated employee role.');
}

// View employees by department
async function viewEmployeesByDepartment() {
  const departments = await db.query('SELECT * FROM department');
  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department:',
      choices: departments.rows.map((department) => ({
        name: department.name,
        value: department.id,
      })),
    },
  ]);

  const { rows } = await db.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title AS role
    FROM employee
    JOIN role ON employee.role_id = role.id
    WHERE role.department_id = $1
  `, [department_id]);
  console.table(rows);
}

// Delete a department
async function deleteDepartment() {
  const departments = await db.query('SELECT * FROM department');
  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department to delete:',
      choices: departments.rows.map((department) => ({
        name: department.name,
        value: department.id,
      })),
    },
  ]);

  const roles = await db.query('SELECT id FROM role WHERE department_id = $1', [department_id]);
  const roleIds = roles.rows.map((role) => role.id);

  if (roleIds.length > 0) {
    await db.query('DELETE FROM employee WHERE role_id = ANY($1)', [roleIds]);
  }

  await db.query('DELETE FROM role WHERE department_id = $1', [department_id]);

  await db.query('DELETE FROM department WHERE id = $1', [department_id]);
  console.log('Department deleted.');
}

// Delete a role
async function deleteRole() {
  const roles = await db.query('SELECT * FROM role');
  const { role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the role to delete:',
      choices: roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
  ]);

  await db.query('DELETE FROM role WHERE id = $1', [role_id]);
  console.log('Role deleted.');
}



mainMenu();