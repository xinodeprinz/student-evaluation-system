import { NextRequest, NextResponse } from "next/server";
import { Subject, User, Class } from "@/lib/db/models";
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
    const classId = searchParams.get("classId");

    const whereClause: any = {};
    if (classId) whereClause.classId = classId;

    const subjects = await Subject.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["firstName", "lastName"],
          required: false,
        },
        { model: Class, as: "class", attributes: ["name"] },
      ],
      order: [["name", "ASC"]],
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
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

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    const subject = await Subject.create({
      name: data.name,
      code: data.code,
      coefficient: data.coefficient,
      classId: data.classId,
      teacherId: data.teacherId || null,
    });

    const fullSubject = await Subject.findByPk(subject.id, {
      include: [
        { model: User, as: "teacher", attributes: ["firstName", "lastName"] },
        { model: Class, as: "class", attributes: ["name"] },
      ],
    });

    return NextResponse.json({ subject: fullSubject }, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
