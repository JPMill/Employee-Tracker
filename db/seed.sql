INSERT INTO department (name)
VALUES ('Engineering'), ('Finance'), ('Human Resources'), ('Sales');

INSERT INTO role (title, salary, department_id)
VALUES 
    ('Software Engineer', 90000, 1),
    ('Accountant', 60000, 2),
    ('HR Manager', 75000, 3),
    ('Sales Representative', 50000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Alice', 'Johnson', 1, NULL),
    ('Bob', 'Smith', 2, NULL),
    ('Charlie', 'Brown', 3, NULL),
    ('Diana', 'Prince', 4, NULL),
    ('Eve', 'Taylor', 1, 1);