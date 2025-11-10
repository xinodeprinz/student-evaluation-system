import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface ClassAttributes {
  id: number;
  name: string;
  level: string;
  academicYear: string;
  teacherId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClassCreationAttributes extends Optional<ClassAttributes, "id"> {}

class Class
  extends Model<ClassAttributes, ClassCreationAttributes>
  implements ClassAttributes
{
  public id!: number;
  public name!: string;
  public level!: string;
  public academicYear!: string;
  public teacherId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Class.init(
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
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "classes",
    timestamps: true,
  }
);

export default Class;
