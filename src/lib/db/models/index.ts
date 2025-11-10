import User from "./User";
import Student from "./Student";
import Class from "./Class";
import Subject from "./Subject";
import Grade from "./Grade";

// Define associations
User.hasOne(Student, { foreignKey: "userId", as: "studentProfile" });
Student.belongsTo(User, { foreignKey: "userId", as: "user" });

Class.hasMany(Student, { foreignKey: "classId", as: "students" });
Student.belongsTo(Class, { foreignKey: "classId", as: "class" });

Class.hasMany(Subject, { foreignKey: "classId", as: "subjects" });
Subject.belongsTo(Class, { foreignKey: "classId", as: "class" });

User.hasMany(Subject, { foreignKey: "teacherId", as: "subjects" });
Subject.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

Student.hasMany(Grade, { foreignKey: "studentId", as: "grades" });
Grade.belongsTo(Student, { foreignKey: "studentId", as: "student" });

Subject.hasMany(Grade, { foreignKey: "subjectId", as: "grades" });
Grade.belongsTo(Subject, { foreignKey: "subjectId", as: "subject" });

export { User, Student, Class, Subject, Grade };

export default {
  User,
  Student,
  Class,
  Subject,
  Grade,
};
