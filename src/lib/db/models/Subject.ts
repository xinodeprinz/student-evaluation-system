import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface SubjectAttributes {
  id: number;
  name: string;
  code: string;
  coefficient: number;
  classId: number;
  teacherId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubjectCreationAttributes extends Optional<SubjectAttributes, "id"> {}

class Subject
  extends Model<SubjectAttributes, SubjectCreationAttributes>
  implements SubjectAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public coefficient!: number;
  public classId!: number;
  public teacherId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subject.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coefficient: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "classes",
        key: "id",
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "subjects",
    timestamps: true,
  }
);

export default Subject;
