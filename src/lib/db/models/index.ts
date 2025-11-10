import User from "./User";
import Student from "./Student";
import Class from "./Class";
import Subject from "./Subject";
import Grade from "./Grade";

// User ↔ Student (1:1)
User.hasOne(Student, {
  foreignKey: "userId",
  as: "studentProfile",
});
Student.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Class ↔ Student (1:N)
Class.hasMany(Student, {
  foreignKey: "classId",
  as: "students",
});
Student.belongsTo(Class, {
  foreignKey: "classId",
  as: "class",
});

// Class ↔ Subject (1:N)
Class.hasMany(Subject, {
  foreignKey: "classId",
  as: "subjects",
});
Subject.belongsTo(Class, {
  foreignKey: "classId",
  as: "class",
});

// Teacher (User) ↔ Class (1:N)
User.hasMany(Class, {
  foreignKey: "teacherId",
  as: "classesAsTeacher",
});
Class.belongsTo(User, {
  foreignKey: "teacherId",
  as: "teacher",
});

// Teacher (User) ↔ Subject (1:N)
User.hasMany(Subject, {
  foreignKey: "teacherId",
  as: "subjectsAsTeacher",
});
Subject.belongsTo(User, {
  foreignKey: "teacherId",
  as: "teacher",
});

// Student ↔ Grade (1:N)
Student.hasMany(Grade, {
  foreignKey: "studentId",
  as: "grades",
});
Grade.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

// Subject ↔ Grade (1:N)
Subject.hasMany(Grade, {
  foreignKey: "subjectId",
  as: "grades",
});
Grade.belongsTo(Subject, {
  foreignKey: "subjectId",
  as: "subject",
});

export { User, Student, Class, Subject, Grade };

export default {
  User,
  Student,
  Class,
  Subject,
  Grade,
};
