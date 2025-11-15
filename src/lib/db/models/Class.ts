import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import Student from "./Student";
import Subject from "./Subject";
import User from "./User";
import AcademicYear from "./AcademicYear";

interface ClassAttributes {
  id: number;
  name: string;
  level: string;
  academicYearId: number;
  teacherId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClassCreationAttributes extends Optional<ClassAttributes, "id"> {}

class Class
  extends Model<ClassAttributes, ClassCreationAttributes>
  implements ClassAttributes
{
  declare id: number;
  declare name: string;
  declare level: string;
  declare academicYearId: number;
  declare teacherId?: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // associations
  declare students?: Student[];
  declare subjects?: Subject[];
  declare teacher?: User;
  declare academicYear?: AcademicYear;
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    academicYearId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "academic_years",
        key: "id",
      },
    },
    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
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
