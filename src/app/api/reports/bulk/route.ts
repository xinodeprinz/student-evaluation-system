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
    const term = searchParams.get("term");
    const sequence = searchParams.get("sequence");
    const academicYearId = searchParams.get("academicYearId");

    if (!classId || !term || !sequence) {
      return NextResponse.json(
        { error: "classId, term, and sequence are required" },
        { status: 400 }
      );
    }

    // Get all students in the class
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

    const reports = [];

    for (const student of students) {
      const grades = await Grade.findAll({
        where: {
          studentId: student.id,
          term: parseInt(term),
          sequence: parseInt(sequence),
        },
        include: [
          {
            model: Subject,
            as: "subject",
            attributes: ["name", "code", "coefficient"],
          },
        ],
      });

      if (grades.length > 0) {
        reports.push({
          student: {
            firstName: student.user?.firstName,
            lastName: student.user?.lastName,
            matricule: student.matricule,
            className: student.class?.name,
          },
          class: {
            name: student.class?.name,
            level: student.class?.level,
            academicYear: student.academicYear?.year,
          },
          term: parseInt(term),
          sequence: parseInt(sequence),
          grades: grades.map((g) => ({
            subject: g.subject?.name,
            code: g.subject?.code,
            score: g.score,
            maxScore: g.maxScore,
            coefficient: g.subject?.coefficient,
            comment: g.comment,
          })),
        });
      }
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error generating bulk reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
