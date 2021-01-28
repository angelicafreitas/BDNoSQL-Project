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

//2 lookup employee by id
db.hrs.find({EMPLOYEE_ID: 100}).pretty();

//3 list employees by manager
db.hrs.aggregate([
    {$project : {MANAGER_ID:1 ,EMPLOYEE_ID: 1, FIRST_NAME:1, SALARY:1, _id:0}},
    {$sort: {MANAGER_ID: 1}}
]);

//5 update employee's salary
db.hrs.updateOne({EMPLOYEE_ID: 100},{$set: {SALARY: 23999}});

//11 average salary by job titles 
db.hrs.aggregate([
    {$group: {_id: "$JOB.JOB_TITLE", avg: {$avg: "$SALARY"}}}
]);

//12 top 3 countries with higher ratio between salary and n of employees
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