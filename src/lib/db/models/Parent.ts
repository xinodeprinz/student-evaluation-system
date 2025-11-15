import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import User from "./User";
import Student from "./Student";

export interface ParentAttributes {
  id: number;
  userId: number;
  phoneNumber?: string;
  address?: string;
  occupation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParentCreationAttributes
  extends Optional<ParentAttributes, "id"> {}

class Parent
  extends Model<ParentAttributes, ParentCreationAttributes>
  implements ParentAttributes
{
  declare id: number;
  declare userId: number;
  declare phoneNumber?: string;
  declare address?: string;
  declare occupation?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // associations
  declare user?: User;
  declare children?: Student[];
}

Parent.init(
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "parents",
    modelName: "Parent",
    timestamps: true,
  }
);

export default Parent;
