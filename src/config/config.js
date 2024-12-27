require('dotenv').config({path: __dirname + "/../.env"});
module.exports = {
  "development": {
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
  },
  "test": {
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
