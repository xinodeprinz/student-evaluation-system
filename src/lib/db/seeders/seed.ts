import sequelize from "../config";
import {
  User,
  Student,
  Class,
  Subject,
  Grade,
  Parent,
  StudentParent,
  AcademicYear,
} from "../models";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    await sequelize.sync({ force: true });
    console.log("✅ Database synced");

    // Create Academic Years
    const currentYear = await AcademicYear.create({
      year: "2024/2025",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-07-31"),
      isActive: true,
    });

    const previousYear = await AcademicYear.create({
      year: "2023/2024",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2024-07-31"),
      isActive: false,
    });

    console.log("✅ Academic years created");

    // Create Users
    const admin = await User.create({
      email: "admin@school.cm",
      password: "admin123",
      firstName: "Admin",
      lastName: "Principal",
      role: "admin",
      phoneNumber: "+237 678 901 234",
    });

    const teacher1 = await User.create({
      email: "teacher@school.cm",
      password: "teacher123",
      firstName: "Ngwa",
      lastName: "Epule",
      role: "teacher",
      phoneNumber: "+237 678 123 456",
    });

    const teacher2 = await User.create({
      email: "teacher2@school.cm",
      password: "teacher123",
      firstName: "Akum",
      lastName: "Bernice",
      role: "teacher",
      phoneNumber: "+237 678 234 567",
    });

    // Create Parent Users
    const parentUser1 = await User.create({
      email: "parent1@school.cm",
      password: "parent123",
      firstName: "Tanyi",
      lastName: "John",
      role: "parent",
      phoneNumber: "+237 677 111 222",
    });

    const parentUser2 = await User.create({
      email: "parent2@school.cm",
      password: "parent123",
      firstName: "Ayuk",
      lastName: "Mary",
      role: "parent",
      phoneNumber: "+237 677 222 333",
    });

    const parentUser3 = await User.create({
      email: "parent3@school.cm",
      password: "parent123",
      firstName: "Nkeng",
      lastName: "Paul",
      role: "parent",
      phoneNumber: "+237 677 333 444",
    });

    // Create Student Users
    const studentUser1 = await User.create({
      email: "tanyi.emmanuel@school.cm",
      password: "student123",
      firstName: "Tanyi",
      lastName: "Emmanuel",
      role: "student",
      phoneNumber: "",
    });

    const studentUser2 = await User.create({
      email: "tanyi.grace@school.cm",
      password: "student123",
      firstName: "Tanyi",
      lastName: "Grace",
      role: "student",
      phoneNumber: "",
    });

    const studentUser3 = await User.create({
      email: "ayuk.grace@school.cm",
      password: "student123",
      firstName: "Ayuk",
      lastName: "Grace",
      role: "student",
      phoneNumber: "",
    });

    const studentUser4 = await User.create({
      email: "nkeng.peter@school.cm",
      password: "student123",
      firstName: "Nkeng",
      lastName: "Peter",
      role: "student",
      phoneNumber: "",
    });

    console.log("✅ Users created");

    // Create Parent Profiles
    const parent1 = await Parent.create({
      userId: parentUser1.id,
      phoneNumber: "+237 677 111 222",
      address: "Mile 4, Nkwen, Bamenda",
      occupation: "Teacher",
    });

    const parent2 = await Parent.create({
      userId: parentUser2.id,
      phoneNumber: "+237 677 222 333",
      address: "Molyko, Buea",
      occupation: "Nurse",
    });

    const parent3 = await Parent.create({
      userId: parentUser3.id,
      phoneNumber: "+237 677 333 444",
      address: "Down Beach, Limbe",
      occupation: "Engineer",
    });

    console.log("✅ Parent profiles created");

    // Create Classes
    const form5A = await Class.create({
      name: "Form 5A",
      level: "Upper Sixth",
      academicYearId: currentYear.id,
      teacherId: teacher1.id,
    });

    const form4B = await Class.create({
      name: "Form 4B",
      level: "Lower Sixth",
      academicYearId: currentYear.id,
      teacherId: teacher2.id,
    });

    console.log("✅ Classes created");

    // Create Students
    const student1 = await Student.create({
      userId: studentUser1.id,
      matricule: "STU2024001",
      classId: form5A.id,
      dateOfBirth: new Date("2007-03-15"),
      placeOfBirth: "Bamenda",
      gender: "Male",
      address: "Mile 4, Nkwen, Bamenda",
      academicYearId: currentYear.id,
    });

    const student2 = await Student.create({
      userId: studentUser2.id,
      matricule: "STU2024002",
      classId: form5A.id,
      dateOfBirth: new Date("2009-07-22"),
      placeOfBirth: "Bamenda",
      gender: "Female",
      address: "Mile 4, Nkwen, Bamenda",
      academicYearId: currentYear.id,
    });

    const student3 = await Student.create({
      userId: studentUser3.id,
      matricule: "STU2024003",
      classId: form5A.id,
      dateOfBirth: new Date("2007-07-22"),
      placeOfBirth: "Buea",
      gender: "Female",
      address: "Molyko, Buea",
      academicYearId: currentYear.id,
    });

    const student4 = await Student.create({
      userId: studentUser4.id,
      matricule: "STU2024004",
      classId: form4B.id,
      dateOfBirth: new Date("2008-01-10"),
      placeOfBirth: "Limbe",
      gender: "Male",
      address: "Down Beach, Limbe",
      academicYearId: currentYear.id,
    });

    console.log("✅ Students created");

    // Link Parents to Students
    await StudentParent.create({
      studentId: student1.id,
      parentId: parent1.id,
      relationship: "Father",
    });

    await StudentParent.create({
      studentId: student2.id,
      parentId: parent1.id,
      relationship: "Father",
    });

    await StudentParent.create({
      studentId: student3.id,
      parentId: parent2.id,
      relationship: "Mother",
    });

    await StudentParent.create({
      studentId: student4.id,
      parentId: parent3.id,
      relationship: "Father",
    });

    console.log("✅ Parent-Student relationships created");

    // Create Subjects
    const subjects = await Subject.bulkCreate([
      {
        name: "Mathematics",
        code: "MATH",
        coefficient: 5,
        classId: form5A.id,
        teacherId: teacher1.id,
      },
      {
        name: "Physics",
        code: "PHY",
        coefficient: 4,
        classId: form5A.id,
        teacherId: teacher1.id,
      },
      {
        name: "Chemistry",
        code: "CHEM",
        coefficient: 4,
        classId: form5A.id,
        teacherId: teacher2.id,
      },
      {
        name: "Biology",
        code: "BIO",
        coefficient: 3,
        classId: form5A.id,
        teacherId: teacher2.id,
      },
      {
        name: "English Language",
        code: "ENG",
        coefficient: 4,
        classId: form5A.id,
        teacherId: teacher2.id,
      },
      {
        name: "French",
        code: "FR",
        coefficient: 3,
        classId: form5A.id,
        teacherId: teacher2.id,
      },
      {
        name: "Computer Science",
        code: "CS",
        coefficient: 3,
        classId: form5A.id,
        teacherId: teacher1.id,
      },

      {
        name: "Mathematics",
        code: "MATH",
        coefficient: 4,
        classId: form4B.id,
        teacherId: teacher1.id,
      },
      {
        name: "Physics",
        code: "PHY",
        coefficient: 3,
        classId: form4B.id,
        teacherId: teacher1.id,
      },
      {
        name: "English Language",
        code: "ENG",
        coefficient: 3,
        classId: form4B.id,
        teacherId: teacher2.id,
      },
    ]);

    console.log("✅ Subjects created");

    // Create Grades for Form 5A students
    const form5ASubjects = subjects.filter((s) => s.classId === form5A.id);

    for (const subject of form5ASubjects) {
      await Grade.create({
        studentId: student1.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 6) + 14,
        maxScore: 20,
        comment: "Good performance",
      });

      await Grade.create({
        studentId: student2.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 5) + 15,
        maxScore: 20,
        comment: "Excellent work",
      });

      await Grade.create({
        studentId: student3.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 5) + 15,
        maxScore: 20,
        comment: "Excellent work",
      });
    }

    // Create Grades for Form 4B student
    const form4BSubjects = subjects.filter((s) => s.classId === form4B.id);

    for (const subject of form4BSubjects) {
      await Grade.create({
        studentId: student4.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 7) + 12,
        maxScore: 20,
        comment: "Keep improving",
      });
    }

    console.log("✅ Grades created");
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Default Login Credentials:");
    console.log("Admin: admin@school.cm / admin123");
    console.log("Teacher: teacher@school.cm / teacher123");
    console.log("Parent 1 (2 children): parent1@school.cm / parent123");
    console.log("Parent 2 (1 child): parent2@school.cm / parent123");
    console.log("Parent 3 (1 child): parent3@school.cm / parent123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
