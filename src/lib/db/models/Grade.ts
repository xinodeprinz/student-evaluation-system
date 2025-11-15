import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import Student from "./Student";
import Subject from "./Subject";

export interface GradeAttributes {
  id: number;
  studentId: number;
  subjectId: number;
  term: number;
  sequence: number;
  score: number;
  maxScore: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GradeCreationAttributes = Optional<
  GradeAttributes,
  "id" | "comment" | "createdAt" | "updatedAt"
>;

class Grade
  extends Model<GradeAttributes, GradeCreationAttributes>
  implements GradeAttributes
{
  declare id: number;
  declare studentId: number;
  declare subjectId: number;
  declare term: number;
  declare sequence: number;
  declare score: number;
  declare maxScore: number;
  declare comment?: string;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // associations
  declare student?: Student;
  declare subject?: Subject;
}

Grade.init(
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
    subjectId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
    term: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sequence: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 20,
    },
    comment: {
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
    tableName: "grades",
    modelName: "Grade",
    timestamps: true,
  }
);

export default Grade;
