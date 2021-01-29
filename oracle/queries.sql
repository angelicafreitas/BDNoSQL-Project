--1 - insert employee
INSERT INTO employees (employee_id, last_name, email, hire_date, job_id, manager_id, department_id) VALUES
(&employee_id, '&last_name', '&email', '&hire_date', '&job_id', &manager_id, &department_id);

--2 - lookup employee by id
SELECT * 
FROM employees e
WHERE e.employee_id=&id;

--3 - list employees by manager
SELECT CONCAT(CONCAT(CONCAT(m.first_name, m.last_name), ', #'),m.employee_id) "Manager",
        e.employee_id, e.first_name, e.last_name,
        e.email, e.phone_number, e.hire_date, e.job_id, 
        e.salary, e.commission_pct, e.department_id
FROM employees e
INNER JOIN employees m
ON e.manager_id=m.employee_id
ORDER BY e.manager_id;

--4 - list employees that started working in year
DEFINE s_year = &start_year;
SELECT e.*m, j.start_date
FROM employees e
FULL OUTER JOIN job_history j
ON e.employee_id=j.employee_id
WHERE extract(year FROM e.hire_date)=&s_year
OR extract(year FROM j.start_date)=&s_year;

--5 - update employee's salary
UPDATE employees e
SET e.salary=&new_salary
WHERE e.employee_id=&employee_id;

--6 - increase employee's salary by 5% if employee has the lowest salary
UPDATE employees e
SET e.salary = 1.05*e.salary
WHERE e.salary = (SELECT min(salary) FROM employees);

--7 - list the average salary of the department with the most employees and commission is null
SELECT d.department_name, "TOTAL".n_employees, "TOTAL".avg_salary from departments d
INNER JOIN (
    SELECT d.department_id, count(1) as n_employees, avg(e.salary) as avg_salary
    FROM employees e
    INNER JOIN departments d
    ON e.department_id=d.department_id
    WHERE e.commission_pct is null
    GROUP BY d.department_id
) "TOTAL"
ON "TOTAL".department_id=d.department_id
ORDER BY "TOTAL".n_employees desc
OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;

--8 - top 3 countries with higher ratio between salary and n of employees
SELECT co.country_id, ROUND(sum(e.salary)/count(*),2) as ratio, min(e.salary) "min salary", max(e.salary) "max salary"
FROM countries co, locations l, departments d, employees e
WHERE co.country_id=l.country_id
AND l.location_id=d.location_id
AND d.department_id=e.department_id 
GROUP BY co.country_id;

--9 - end job
CREATE OR REPLACE PROCEDURE end_job(id_employee NUMBER)
IS
    e_start_date DATE;
    e_job_id VARCHAR2(10);
    e_department_id NUMBER ;
    aux number;
BEGIN
    SELECT hire_date INTO e_start_date from employees where employee_id=id_employee;
    SELECT job_id INTO e_job_id from employees where employee_id=id_employee;  
    SELECT department_id INTO e_department_id from employees where employee_id=id_employee;  
    
    
    INSERT INTO job_history (employee_id, start_date, end_date, job_id, department_id) 
    VALUES (id_employee,e_start_date,(SELECT CURRENT_DATE FROM DUAL),e_job_id,e_department_id);
END;
/

--call end_job(__)

--11 - average salary by job titles
select js.job_title "job title", "avg_salary"."avg_s" "average salary"
from jobs js
inner join (
SELECT j.job_id, avg(e.salary) "avg_s"
FROM employees e, jobs j
WHERE e.job_id=j.job_id
group by j.job_id) "avg_salary"
on "avg_salary".job_id=js.job_id;


--12 - employees that haven't changed positions
select e.* from job_history j 
right join employees e 
on j.employee_id=e.employee_id 
where j.employee_id is null;