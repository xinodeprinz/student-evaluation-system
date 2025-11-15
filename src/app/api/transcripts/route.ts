import { NextRequest, NextResponse } from "next/server";
import {
  Grade,
  Student,
  Subject,
  User,
  Class,
  AcademicYear,
} from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const academicYearId = searchParams.get("academicYearId");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const student = await Student.findByPk(studentId, {
      include: [
        { model: User, as: "user", attributes: ["firstName", "lastName"] },
        { model: Class, as: "class", attributes: ["name", "level"] },
        { model: AcademicYear, as: "academicYear", attributes: ["year"] },
      ],
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get all grades for the student
    const whereClause: any = { studentId };

    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          as: "subject",
          attributes: ["name", "code", "coefficient"],
        },
      ],
      order: [
        ["term", "ASC"],
        ["sequence", "ASC"],
      ],
    });

    const transcriptData = {
      student: {
        firstName: student.user?.firstName,
        lastName: student.user?.lastName,
        matricule: student.matricule,
        className: student.class?.name,
        dateOfBirth: new Date(student.dateOfBirth).toLocaleDateString("en-GB"),
        placeOfBirth: student.placeOfBirth,
      },
      academicYear: student.academicYear?.year,
      allGrades: grades.map((g) => ({
        term: g.term,
        sequence: g.sequence,
        subject: g.subject?.name,
        score: g.score,
        maxScore: g.maxScore,
        coefficient: g.subject?.coefficient,
      })),
    };

    return NextResponse.json({ transcript: transcriptData });
  } catch (error) {
    console.error("Error generating transcript:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
