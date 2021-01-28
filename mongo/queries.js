/* 
docker start b87
docker exec -it b87 bash
nano hr.json
copiar conteúdo ficheiro
docker cp hr.json b87fb41cd521:/hr.json
mongo
use hr
db.createCollection("hrs")
mongoimport -d hr -c hrs hr.json --jsonArray
 */


//1 insert employee
var employee = {
    "EMPLOYEE_ID": 1049,
    "FIRST_NAME": "Alexander",
    "LAST_NAME": "Hunold",
    "EMAIL": "AHUNOLD", 
    "PHONE_NUMBER": "590.423.4567", 
    "HIRE_DATE": "2006-01-03T00:00:00", 
    "SALARY": 9000, 
    "COMMISSION_PCT": "null", 
    "MANAGER_ID": 102, 
    "DEPARTMENT": {
        "DEPARTMENT_ID": 60, 
        "DEPARTMENT_NAME": "IT", 
        "MANAGER_ID": 103, 
        "LOCATION_ID": 1400, 
        "LOCATION": {
            "LOCATION_ID": 1400, 
            "STREET_ADDRESS": "2014 Jabberwocky Rd", 
            "POSTAL_CODE": "26192", 
            "CITY": "Southlake", 
            "STATE_PROVINCE": "Texas", 
            "COUNTRY_ID": "US", 
            "COUNTRY": {
                "COUNTRY_ID": "US", 
                "COUNTRY_NAME": "United States of America", 
                "REGION_ID": 2, 
                "REGION": {
                    "REGION_ID": 2, 
                    "REGION_NAME": "Americas"
                }
            }
        }
    }, 
    "JOB": {
        "JOB_ID": "IT_PROG", 
        "JOB_TITLE": "Programmer", 
        "MIN_SALARY": 4000, 
        "MAX_SALARY": 10000
    }, 
    "JOB_HISTORY": []
}
db.hrs.insert(employee);

//2 lookup employee by id
db.hrs.find({EMPLOYEE_ID: 100}).pretty();

//3 list employees by manager
db.hrs.aggregate([
    {$project : {"MANAGER.EMPLOYEE_ID": 1 ,EMPLOYEE_ID: 1, FIRST_NAME:1, SALARY:1, _id:0}},
    {$sort: {"MANAGER.EMPLOYEE_ID": 1}}
]);

//4 list employees that started working in year _
db.hrs.find({$or: [{HIRE_DATE: {$regex: /2006-.*/}}, {"JOB_HISTORY.START_DATE": {$regex: /2006-.*/}}]}).pretty();

//5 update employee's salary
db.hrs.updateOne({EMPLOYEE_ID: 100},{$set: {SALARY: 23999}});

//6 increase employee's salary by 5% if employee has the lowest salary within job id
db.hrs.update({ $expr: {$eq: ["$SALARY","$JOB.MIN_SALARY"] },"JOB.JOB_ID": "SH_CLERK" }, { $mul: { SALARY: 1.05 } }, {multi: true})

//8 top 3 countries with higher ratio between salary and n of employees
db.hrs.aggregate([
    {$group: 
        {
            _id: "$DEPARTMENT.LOCATION.COUNTRY.COUNTRY_ID", 
            salary: {$sum: "$SALARY"},
            num: {$sum: 1}
        }
    },
    {
        $project: {ratio: {$divide: ["$salary","$num"]}}
    },
    {
        $sort: {ratio: -1}
    },
    {
        $limit: 3
    }
]);

//11 average salary by job titles 
db.hrs.aggregate([
    {$group: {_id: "$JOB.JOB_TITLE", avg: {$avg: "$SALARY"}}}
]);

