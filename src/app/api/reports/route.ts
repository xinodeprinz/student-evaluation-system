import { NextRequest, NextResponse } from "next/server";
import { Grade, Student, Subject, User, Class } from "@/lib/db/models";
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
    const term = searchParams.get("term");
    const sequence = searchParams.get("sequence");

    if (!studentId || !term || !sequence) {
      return NextResponse.json(
        { error: "studentId, term, and sequence are required" },
        { status: 400 }
      );
    }

    const student = await Student.findByPk(studentId, {
      include: [
        { model: User, as: "user", attributes: ["firstName", "lastName"] },
        {
          model: Class,
          as: "class",
          attributes: ["name", "level", "academicYear"],
        },
      ],
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const grades = await Grade.findAll({
      where: {
        studentId,
        term,
        sequence,
      },
      include: [
        {
          model: Subject,
          as: "subject",
          attributes: ["name", "code", "coefficient"],
        },
      ],
    });

    const reportData = {
      student: {
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        matricule: student.matricule,
        className: student.class.name,
      },
      class: {
        name: student.class.name,
        level: student.class.level,
        academicYear: student.class.academicYear,
      },
      term: parseInt(term),
      sequence: parseInt(sequence),
      grades: grades.map((g) => ({
        subject: g.subject.name,
        code: g.subject.code,
        score: g.score,
        maxScore: g.maxScore,
        coefficient: g.subject.coefficient,
        comment: g.comment,
      })),
    };

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
