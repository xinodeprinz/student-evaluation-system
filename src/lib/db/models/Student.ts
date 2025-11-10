import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

export type Gender = "Male" | "Female";

export interface StudentAttributes {
  id: number;
  userId: number;
  matricule: string;
  classId: number;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: Gender;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StudentCreationAttributes = Optional<
  StudentAttributes,
  "id" | "parentName" | "parentPhone" | "address" | "createdAt" | "updatedAt"
>;

class Student
  extends Model<StudentAttributes, StudentCreationAttributes>
  implements StudentAttributes
{
  declare id: number;
  declare userId: number;
  declare matricule: string;
  declare classId: number;
  declare dateOfBirth: Date;
  declare placeOfBirth: string;
  declare gender: Gender;
  declare parentName?: string;
  declare parentPhone?: string;
  declare address?: string;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // associations
  declare user?: any;
  declare class?: any;
  declare grades?: any[];
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    matricule: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "classes",
        key: "id",
      },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    placeOfBirth: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },
    parentName: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    parentPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "students",
    modelName: "Student",
    timestamps: true,
  }
);

export default Student;
