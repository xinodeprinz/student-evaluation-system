import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import Student from "./Student";
import Class from "./Class";

export interface AcademicYearAttributes {
  id: number;
  year: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AcademicYearCreationAttributes
  extends Optional<AcademicYearAttributes, "id"> {}

class AcademicYear
  extends Model<AcademicYearAttributes, AcademicYearCreationAttributes>
  implements AcademicYearAttributes
{
  declare id: number;
  declare year: string;
  declare startDate: Date;
  declare endDate: Date;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // associations
  declare students?: Student[];
  declare classes?: Class[];
}

AcademicYear.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "academic_years",
    modelName: "AcademicYear",
    timestamps: true,
  }
);

export default AcademicYear;
