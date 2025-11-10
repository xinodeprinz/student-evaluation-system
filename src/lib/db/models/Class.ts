import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

export interface ClassAttributes {
  id: number;
  name: string;
  level: string;
  academicYear: string;
  teacherId?: number; // FK to users.id (teacher)
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClassCreationAttributes = Optional<
  ClassAttributes,
  "id" | "teacherId" | "createdAt" | "updatedAt"
>;

class Class
  extends Model<ClassAttributes, ClassCreationAttributes>
  implements ClassAttributes
{
  declare id: number;
  declare name: string;
  declare level: string;
  declare academicYear: string;
  declare teacherId?: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // associations
  declare students?: any[];
  declare subjects?: any[];
  declare teacher?: any;
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "classes",
    modelName: "Class",
    timestamps: true,
  }
);

export default Class;
