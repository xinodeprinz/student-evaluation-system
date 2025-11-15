import { NextRequest, NextResponse } from "next/server";
import { Grade, Student, Subject, User } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";
import { WhereOptions } from "sequelize";

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

    const whereClause: WhereOptions<Grade> = {};
    if (studentId) whereClause.studentId = studentId;
    if (term) whereClause.term = term;
    if (sequence) whereClause.sequence = sequence;

    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: User, as: "user", attributes: ["firstName", "lastName"] },
          ],
        },
        {
          model: Subject,
          as: "subject",
          attributes: ["name", "code", "coefficient"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (
      !currentUser ||
      (currentUser.role !== "teacher" && currentUser.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    // Check if grade already exists
    const existingGrade = await Grade.findOne({
      where: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        term: data.term,
        sequence: data.sequence,
      },
    });

    let grade;
    if (existingGrade) {
      await existingGrade.update({
        score: data.score,
        maxScore: data.maxScore || 20,
        comment: data.comment,
      });
      grade = existingGrade;
    } else {
      grade = await Grade.create({
        studentId: data.studentId,
        subjectId: data.subjectId,
        term: data.term,
        sequence: data.sequence,
        score: data.score,
        maxScore: data.maxScore || 20,
        comment: data.comment,
      });
    }

    const fullGrade = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: User, as: "user", attributes: ["firstName", "lastName"] },
          ],
        },
        {
          model: Subject,
          as: "subject",
          attributes: ["name", "code", "coefficient"],
        },
      ],
    });

    return NextResponse.json({ grade: fullGrade }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
