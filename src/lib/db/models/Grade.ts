import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface GradeAttributes {
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

interface GradeCreationAttributes extends Optional<GradeAttributes, "id"> {}

class Grade
  extends Model<GradeAttributes, GradeCreationAttributes>
  implements GradeAttributes
{
  public id!: number;
  public studentId!: number;
  public subjectId!: number;
  public term!: number;
  public sequence!: number;
  public score!: number;
  public maxScore!: number;
  public comment?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Grade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
    term: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3,
      },
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 2,
      },
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
  },
  {
    sequelize,
    tableName: "grades",
    timestamps: true,
  }
);

export default Grade;
