import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "ses",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "xino4LIFE@",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3307,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
