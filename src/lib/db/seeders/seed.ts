import sequelize from "../config";
import { User, Student, Class, Subject, Grade } from "../models";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Sync all models
    await sequelize.sync({ force: true });
    console.log("✅ Database synced");

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

    const studentUser = await User.create({
      email: "student@school.cm",
      password: "student123",
      firstName: "Tanyi",
      lastName: "Emmanuel",
      role: "student",
      phoneNumber: "+237 678 345 678",
    });

    const studentUser2 = await User.create({
      email: "student2@school.cm",
      password: "student123",
      firstName: "Ayuk",
      lastName: "Grace",
      role: "student",
      phoneNumber: "+237 678 456 789",
    });

    const studentUser3 = await User.create({
      email: "student3@school.cm",
      password: "student123",
      firstName: "Nkeng",
      lastName: "Peter",
      role: "student",
      phoneNumber: "+237 678 567 890",
    });

    console.log("✅ Users created");

    // Create Classes
    const form5A = await Class.create({
      name: "Form 5A",
      level: "Upper Sixth",
      academicYear: "2025/2026",
      teacherId: teacher1.id,
    });

    const form4B = await Class.create({
      name: "Form 4B",
      level: "Lower Sixth",
      academicYear: "2025/2026",
      teacherId: teacher2.id,
    });

    console.log("✅ Classes created");

    // Create Students
    const student1 = await Student.create({
      userId: studentUser.id,
      matricule: "STU2025001",
      classId: form5A.id,
      dateOfBirth: new Date("2007-03-15"),
      placeOfBirth: "Bamenda",
      gender: "Male",
      parentName: "Mr. Tanyi John",
      parentPhone: "+237 677 111 222",
      address: "Mile 4, Nkwen, Bamenda",
    });

    const student2 = await Student.create({
      userId: studentUser2.id,
      matricule: "STU2025002",
      classId: form5A.id,
      dateOfBirth: new Date("2007-07-22"),
      placeOfBirth: "Buea",
      gender: "Female",
      parentName: "Mrs. Ayuk Mary",
      parentPhone: "+237 677 222 333",
      address: "Molyko, Buea",
    });

    const student3 = await Student.create({
      userId: studentUser3.id,
      matricule: "STU2025003",
      classId: form4B.id,
      dateOfBirth: new Date("2008-01-10"),
      placeOfBirth: "Limbe",
      gender: "Male",
      parentName: "Mr. Nkeng Paul",
      parentPhone: "+237 677 333 444",
      address: "Down Beach, Limbe",
    });

    console.log("✅ Students created");

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

    // Create Grades for Form 5A students (Term 1, Sequence 1)
    const form5ASubjects = subjects.filter((s) => s.classId === form5A.id);

    for (const subject of form5ASubjects) {
      await Grade.create({
        studentId: student1.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 6) + 14, // 14-20
        maxScore: 20,
        comment: "Good performance",
      });

      await Grade.create({
        studentId: student2.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 5) + 15, // 15-20
        maxScore: 20,
        comment: "Excellent work",
      });
    }

    // Create Grades for Form 4B student
    const form4BSubjects = subjects.filter((s) => s.classId === form4B.id);

    for (const subject of form4BSubjects) {
      await Grade.create({
        studentId: student3.id,
        subjectId: subject.id,
        term: 1,
        sequence: 1,
        score: Math.floor(Math.random() * 7) + 12, // 12-19
        maxScore: 20,
        comment: "Keep improving",
      });
    }

    console.log("✅ Grades created");
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Default Login Credentials:");
    console.log("Admin: admin@school.cm / admin123");
    console.log("Teacher: teacher@school.cm / teacher123");
    console.log("Student: student@school.cm / student123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
