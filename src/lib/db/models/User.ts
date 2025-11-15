import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import bcrypt from "bcryptjs";
import Student from "./Student";
import Class from "./Class";
import Subject from "./Subject";
import Parent from "./Parent";

export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "phoneNumber" | "createdAt" | "updatedAt"
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare role: UserRole;
  declare phoneNumber?: string;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // association placeholders (filled via models/index.ts)
  declare studentProfile?: Student;
  declare classesAsTeacher?: Class[];
  declare subjectsAsTeacher?: Subject[];
  declare parentProfile?: Parent;

  async comparePassword(plain: string): Promise<boolean> {
    // this.password is now the real column value (no shadowing).
    return bcrypt.compare(plain, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "teacher", "student", "parent"),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
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
    tableName: "users",
    modelName: "User",
    timestamps: true,
    hooks: {
      async beforeCreate(user) {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      async beforeUpdate(user) {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: [] }, // keep password for auth queries; filter when returning to client
    },
  }
);

export default User;
