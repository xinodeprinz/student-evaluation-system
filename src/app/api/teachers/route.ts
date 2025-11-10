import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await User.findAll({
      where: { role: "teacher" },
      attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
      order: [["firstName", "ASC"]],
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
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

    const teacher = await User.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "teacher",
      phoneNumber: data.phoneNumber,
    });

    return NextResponse.json(
      {
        teacher: {
          id: teacher.id,
          email: teacher.email,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          phoneNumber: teacher.phoneNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
