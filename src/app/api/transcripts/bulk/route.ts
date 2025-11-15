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

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const academicYearId = searchParams.get("academicYearId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = { classId: parseInt(classId) };
    if (academicYearId) {
      whereClause.academicYearId = parseInt(academicYearId);
    }

    const students = await Student.findAll({
      where: whereClause,
      include: [
        { model: User, as: "user", attributes: ["firstName", "lastName"] },
        { model: Class, as: "class", attributes: ["name", "level"] },
        { model: AcademicYear, as: "academicYear", attributes: ["year"] },
      ],
    });

    const transcripts = [];

    for (const student of students) {
      const grades = await Grade.findAll({
        where: { studentId: student.id },
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

      if (grades.length > 0) {
        transcripts.push({
          student: {
            firstName: student.user?.firstName,
            lastName: student.user?.lastName,
            matricule: student.matricule,
            className: student.class?.name,
            dateOfBirth: new Date(student.dateOfBirth).toLocaleDateString(
              "en-GB"
            ),
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
        });
      }
    }

    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error("Error generating bulk transcripts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
