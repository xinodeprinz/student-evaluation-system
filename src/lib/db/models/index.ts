import User from "./User";
import Student from "./Student";
import Class from "./Class";
import Subject from "./Subject";
import Grade from "./Grade";
import Parent from "./Parent";
import StudentParent from "./StudentParent";
import AcademicYear from "./AcademicYear";

// User relationships
User.hasOne(Student, { foreignKey: "userId", as: "studentProfile" });
Student.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(Parent, { foreignKey: "userId", as: "parentProfile" });
Parent.belongsTo(User, { foreignKey: "userId", as: "user" });

// Class relationships
Class.hasMany(Student, { foreignKey: "classId", as: "students" });
Student.belongsTo(Class, { foreignKey: "classId", as: "class" });

Class.hasMany(Subject, { foreignKey: "classId", as: "subjects" });
Subject.belongsTo(Class, { foreignKey: "classId", as: "class" });

User.hasMany(Subject, { foreignKey: "teacherId", as: "subjects" });
Subject.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

User.hasMany(Class, { foreignKey: "teacherId", as: "classesAsTeacher" });
Class.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

// Grade relationships
Student.hasMany(Grade, { foreignKey: "studentId", as: "grades" });
Grade.belongsTo(Student, { foreignKey: "studentId", as: "student" });

Subject.hasMany(Grade, { foreignKey: "subjectId", as: "grades" });
Grade.belongsTo(Subject, { foreignKey: "subjectId", as: "subject" });

// Parent-Student Many-to-Many
Parent.belongsToMany(Student, {
  through: StudentParent,
  foreignKey: "parentId",
  as: "children",
});

Student.belongsToMany(Parent, {
  through: StudentParent,
  foreignKey: "studentId",
  as: "parents",
});

StudentParent.belongsTo(Student, { foreignKey: "studentId", as: "student" });
StudentParent.belongsTo(Parent, { foreignKey: "parentId", as: "parent" });

// Academic Year relationships
AcademicYear.hasMany(Student, { foreignKey: "academicYearId", as: "students" });
Student.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  as: "academicYear",
});

AcademicYear.hasMany(Class, { foreignKey: "academicYearId", as: "classes" });
Class.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  as: "academicYear",
});

export {
  User,
  Student,
  Class,
  Subject,
  Grade,
  Parent,
  StudentParent,
  AcademicYear,
};

export default {
  User,
  Student,
  Class,
  Subject,
  Grade,
  Parent,
  StudentParent,
  AcademicYear,
};
