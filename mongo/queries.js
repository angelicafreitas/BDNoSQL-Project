/* 
docker start b87
nano hr.json
copiar conteúdo ficheiro
docker cp hr.json b87fb41cd521:/hr.json
docker exec -it b87 bash
mongo
use hr
db.createCollection("hrs")
exit
mongoimport -d hr -c hrs hr.json --jsonArray
 */

//1 insert employee
var employee = {
    "EMPLOYEE_ID": 12345, 
    "FIRST_NAME": "Steven", 
    "LAST_NAME": "King", 
    "EMAIL": "SKING", 
    "PHONE_NUMBER": "515.123.4567", 
    "HIRE_DATE": "2003-06-17T00:00:00", 
    "SALARY": 24000, 
    "COMMISSION_PCT": "null", 
    "DEPARTMENT": {
        "DEPARTMENT_ID": 90, 
        "DEPARTMENT_NAME": "Executive", 
        "MANAGER_ID": 100, 
        "LOCATION_ID": 1700, 
        "LOCATION": {
            "LOCATION_ID": 1700, 
            "STREET_ADDRESS": "2004 Charade Rd", 
            "POSTAL_CODE": "98199", 
            "CITY": "Seattle", 
            "STATE_PROVINCE": "Washington", 
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
        "JOB_ID": "AD_PRES", 
        "JOB_TITLE": "President", 
        "MIN_SALARY": 20080, 
        "MAX_SALARY": 40000
    }, 
    "JOB_HISTORY": [],
    "MANAGER": "null"
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
db.hrs.find({HIRE_DATE: {$regex: /2006-.*/}}).pretty();

//5 update employee's salary
db.hrs.updateOne({EMPLOYEE_ID: 100},{$set: {SALARY: 23999}});

//6 increase employee's salary by 5% if employee has the lowest salary within job id
db.hrs.update({ $expr: {$eq: ["$SALARY","$JOB.MIN_SALARY"] },"JOB.JOB_ID": "SH_CLERK" }, { $mul: { SALARY: 1.05 } }, {multi: true})

//7 list the average salary of the department with the most employees and commission is null
db.hrs.aggregate([
    {$group: 
        {
            _id: "$DEPARTMENT.DEPARTMENT_NAME", 
            salary: {$sum: "$SALARY"},
            employees: {$sum: 1}
        }
    },
    {
        $project: {_id:1,employees:1,avg: {$divide: ["$salary","$employees"]}}
    },
    {
        $sort: {employees: -1}
    },
    {
        $limit: 1
    }
]);

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

//9 end job
var h_date = db.hrs.findOne({EMPLOYEE_ID: 103},{HIRE_DATE:1,_id:0});
var j_id = db.hrs.findOne({EMPLOYEE_ID: 103},{"JOB.JOB_ID":1,_id:0});
var d_id = db.hrs.findOne({EMPLOYEE_ID: 103},{"DEPARTMENT.DEPARTMENT_ID":1,_id:0});

db.hrs.update(
    {EMPLOYEE_ID:103},
    {
        "$push": {JOB_HISTORY:{
                EMPLOYEE_ID: 103, 
                START_DATE: hdate, 
                END_DATE: "2021-02-12", 
                JOB_ID: j_id, 
                DEPARTMENT_ID: d_id}
        }
    }
)

//10 add job
var h_datee = db.hrs.findOne({EMPLOYEE_ID: 103},{HIRE_DATE:1,_id:0});
var j_idd = db.hrs.findOne({EMPLOYEE_ID: 103},{"JOB.JOB_ID":1,_id:0});
var d_idd = db.hrs.findOne({EMPLOYEE_ID: 103},{"DEPARTMENT.DEPARTMENT_ID":1,_id:0});

db.hrs.update(
    {EMPLOYEE_ID:103},
    {
        "$push": {JOB_HISTORY:{
                EMPLOYEE_ID: 103, 
                START_DATE: hdatee, 
                END_DATE: "2021-02-12", 
                JOB_ID: j_idd, 
                DEPARTMENT_ID: d_idd}
        }
    }
)

db.hrs.update({EMPLOYEE_ID:103},{$set:{HIRE_DATE:"2021-02-12", "JOB.JOB_ID":"AD_PRES"}, "DEPARTMENT.DEPARTMENT_ID":10})

//11 average salary by job titles 
db.hrs.aggregate([
    {$group: {_id: "$JOB.JOB_TITLE", avg: {$avg: "$SALARY"}}}
]);

//12 employees that haven't changed positions
db.hrs.find({JOB_HISTORY:{ $exists: true, $eq: []}},{_id:0}).pretty();

//13 employees that aren't in the company anymore 
db.hrs.aggregate([
     {$match: {JOB_HISTORY:{$ne: []}}},
    {
       $project: {
        _id:0,
        EMPLOYEE_ID:1,
          res: {
             $filter: {
                input: "$JOB_HISTORY",
                as: "jh",
                cond: {$eq: [ "$$jh.START_DATE", "$HIRE_DATE" ] }
             }
          }
       }
    },
    {$match: {res: {$ne: []}}}
 ]);