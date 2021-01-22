import cx_Oracle
import os

SQL_QUERIES = ["""SELECT JSON_OBJECT ('COUNTRY_ID' VALUE COUNTRY_ID,
                    'COUNTRY_NAME' VALUE COUNTRY_NAME,
                    'REGION_ID' VALUE REGION_ID)
                    FROM COUNTRIES""",

"""SELECT JSON_OBJECT ('EMPLOYEE_ID' VALUE EMPLOYEE_ID,
                    'FIRST_NAME' VALUE FIRST_NAME,
                    'LAST_NAME' VALUE LAST_NAME,
                    'EMAIL' VALUE EMAIL,
                    'PHONE_NUMBER' VALUE PHONE_NUMBER,
                    'HIRE_DATE' VALUE HIRE_DATE,
                    'JOB_ID' VALUE JOB_ID,
                    'SALARY' VALUE SALARY,
                    'COMMISSION_PCT' VALUE COMMISSION_PCT,
                    'MANAGER_ID' VALUE MANAGER_ID,
                    'DEPARTMENT_ID' VALUE DEPARTMENT_ID)
                    FROM EMPLOYEES""",

"""SELECT JSON_OBJECT ('DEPARTMENT_ID' VALUE DEPARTMENT_ID,
                    'DEPARTMENT_NAME' VALUE DEPARTMENT_NAME,
                    'MANAGER_ID' VALUE MANAGER_ID,
                    'LOCATION_ID' VALUE LOCATION_ID)
                    FROM DEPARTMENTS""",

"""SELECT JSON_OBJECT ('REGION_ID' VALUE REGION_ID,
                    'REGION_NAME' VALUE REGION_NAME)
                    FROM REGIONS""",

"""SELECT JSON_OBJECT ('LOCATION_ID' VALUE LOCATION_ID,
                    'STREET_ADDRESS' VALUE STREET_ADDRESS,
                    'POSTAL_CODE' VALUE POSTAL_CODE,
                    'CITY' VALUE CITY,
                    'STATE_PROVINCE' VALUE STATE_PROVINCE,
                    'COUNTRY_ID' VALUE COUNTRY_ID)
                    FROM LOCATIONS""",

"""SELECT JSON_OBJECT ('JOB_ID' VALUE JOB_ID,
                    'JOB_TITLE' VALUE JOB_TITLE,
                    'MIN_SALARY' VALUE MIN_SALARY,
                    'MAX_SALARY' VALUE MAX_SALARY)
                    FROM JOBS""",

"""SELECT JSON_OBJECT ('EMPLOYEE_ID' VALUE EMPLOYEE_ID,
                    'START_DATE' VALUE START_DATE,
                    'END_DATE' VALUE END_DATE,
                    'JOB_ID' VALUE JOB_ID,
                    'DEPARTMENT_ID' VALUE DEPARTMENT_ID)
                    FROM JOB_HISTORY"""]

def main():
  try:
    dsn_tns = cx_Oracle.makedsn('0.0.0.0', '1521', service_name='orclpdb1.localdomain')
    connection = cx_Oracle.connect(user='hr', password='pass', dsn=dsn_tns)
    i = 0
    tables = {}

    for query in SQL_QUERIES:
      cursor = connection.cursor()
      result = cursor.execute(query).fetchall()
      os.system(f'touch {i}.json')
      array = []

      for item in result:
        item_pythonic = item[0].replace("null","None")
        array.append(item_pythonic)
        os.system(f"echo '{item_pythonic}' >> {i}.json")

      tables[i] = array
      i += 1
      cursor.close()

    print(tables)
    connection.close()
  except Exception as identifier:
    print(identifier)
    exit(99)


if __name__ == '__main__':
    main()