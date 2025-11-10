import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface StudentAttributes {
  id: number;
  userId: number;
  matricule: string;
  classId: number;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: "Male" | "Female";
  parentName?: string;
  parentPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudentCreationAttributes extends Optional<StudentAttributes, "id"> {}

class Student
  extends Model<StudentAttributes, StudentCreationAttributes>
  implements StudentAttributes
{
  public id!: number;
  public userId!: number;
  public matricule!: string;
  public classId!: number;
  public dateOfBirth!: Date;
  public placeOfBirth!: string;
  public gender!: "Male" | "Female";
  public parentName?: string;
  public parentPhone?: string;
  public address?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
    parentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "students",
    timestamps: true,
  }
);

export default Student;
