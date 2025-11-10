import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ses", "root", "xino4LIFE@", {
  host: "localhost",
  port: 3307,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
