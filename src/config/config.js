require('dotenv').config({path: __dirname + "/../.env"});
module.exports = {
  "development": {
    "username": "postgres",
    "password": "123",
    "database": "patch",
    "host": "localhost",
    "dialect": "postgres",
    "port": 5432
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": process.env.DATBASE_HOSTNAME,
    "dialect": "postgres",
    "dialectOptions" : {
      "ssl" : {
        "require" : true,
        "rejectUnauthorized" : false
      }
    },
    "port": 5432
  }
}
