import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import Student from "./Student";
import Parent from "./Parent";

export interface StudentParentAttributes {
  id: number;
  studentId: number;
  parentId: number;
  relationship: "Father" | "Mother" | "Guardian" | "Other";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentParentCreationAttributes
  extends Optional<StudentParentAttributes, "id"> {}

class StudentParent
  extends Model<StudentParentAttributes, StudentParentCreationAttributes>
  implements StudentParentAttributes
{
  declare id: number;
  declare studentId: number;
  declare parentId: number;
  declare relationship: "Father" | "Mother" | "Guardian" | "Other";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // associations
  declare student: Student;
  declare parent: Parent;
}

StudentParent.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "parents",
        key: "id",
      },
    },
    relationship: {
      type: DataTypes.ENUM("Father", "Mother", "Guardian", "Other"),
      allowNull: false,
      defaultValue: "Guardian",
    },
  },
  {
    sequelize,
    tableName: "student_parents",
    modelName: "StudentParent",
    timestamps: true,
  }
);

export default StudentParent;
