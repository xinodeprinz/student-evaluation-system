import { NextRequest, NextResponse } from "next/server";
import { Class, User } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await Class.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["firstName", "lastName"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
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
    const newClass = await Class.create({
      name: data.name,
      level: data.level,
      academicYearId: data.academicYearId,
      teacherId: data.teacherId || null,
    });

    const classWithTeacher = await Class.findByPk(newClass.id, {
      include: [
        { model: User, as: "teacher", attributes: ["firstName", "lastName"] },
      ],
    });

    return NextResponse.json({ class: classWithTeacher }, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
