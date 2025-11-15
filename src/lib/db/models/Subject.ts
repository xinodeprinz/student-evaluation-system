import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import Class from "./Class";
import User from "./User";
import Grade from "./Grade";

export interface SubjectAttributes {
  id: number;
  name: string;
  code: string;
  coefficient: number;
  classId: number;
  teacherId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubjectCreationAttributes = Optional<
  SubjectAttributes,
  "id" | "teacherId" | "createdAt" | "updatedAt"
>;

class Subject
  extends Model<SubjectAttributes, SubjectCreationAttributes>
  implements SubjectAttributes
{
  declare id: number;
  declare name: string;
  declare code: string;
  declare coefficient: number;
  declare classId: number;
  declare teacherId?: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // associations
  declare class?: Class;
  declare teacher?: User;
  declare grades?: Grade[];
}

Subject.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    coefficient: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "classes",
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
    tableName: "subjects",
    modelName: "Subject",
    timestamps: true,
  }
);

export default Subject;
