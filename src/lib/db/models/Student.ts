import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import User from "./User";
import Class from "./Class";
import Grade from "./Grade";
import Parent from "./Parent";
import AcademicYear from "./AcademicYear";

export interface StudentAttributes {
  id: number;
  userId: number;
  matricule: string;
  classId: number;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: "Male" | "Female";
  address?: string;
  academicYearId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentCreationAttributes
  extends Optional<StudentAttributes, "id"> {}

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
  declare gender: "Male" | "Female";
  declare address?: string;
  declare academicYearId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // associations
  declare user?: User;
  declare class?: Class;
  declare grades?: Grade[];
  declare parents?: Parent[];
  declare academicYear?: AcademicYear;
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
      type: DataTypes.STRING,
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    placeOfBirth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    academicYearId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "academic_years",
        key: "id",
      },
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
