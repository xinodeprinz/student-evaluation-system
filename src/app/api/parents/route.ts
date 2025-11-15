import { NextRequest, NextResponse } from "next/server";
import { Parent, User, StudentParent } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parents = await Parent.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email", "phoneNumber"],
        },
      ],
      order: [[{ model: User, as: "user" }, "firstName", "ASC"]],
    });

    return NextResponse.json({ parents });
  } catch (error) {
    console.error("Error fetching parents:", error);
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

    // Validate password for creation
    if (!data.password || data.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create user first
    const user = await User.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "parent",
      phoneNumber: data.phoneNumber,
    });

    // Create parent profile
    const parent = await Parent.create({
      userId: user.id,
      phoneNumber: data.phoneNumber,
      address: data.address,
      occupation: data.occupation,
    });

    // Link to students if provided
    if (data.studentIds && data.studentIds.length > 0) {
      for (const studentId of data.studentIds) {
        await StudentParent.create({
          parentId: parent.id,
          studentId: parseInt(studentId),
          relationship: data.relationship || "Guardian",
        });
      }
    }

    const fullParent = await Parent.findByPk(parent.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email"],
        },
      ],
    });

    return NextResponse.json({ parent: fullParent }, { status: 201 });
  } catch (error) {
    console.error("Error creating parent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
