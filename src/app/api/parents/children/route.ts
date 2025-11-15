import { NextRequest, NextResponse } from "next/server";
import {
  Parent,
  Student,
  User,
  Class,
  AcademicYear,
  StudentParent,
} from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find parent profile
    const parent = await Parent.findOne({
      where: { userId: currentUser.userId },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Parent profile not found" },
        { status: 404 }
      );
    }

    // Get all children with their relationships
    const studentParents = await StudentParent.findAll({
      where: { parentId: parent.id },
      include: [
        {
          model: Student,
          as: "student",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName", "email"],
            },
            { model: Class, as: "class", attributes: ["name", "level"] },
            {
              model: AcademicYear,
              as: "academicYear",
              attributes: ["year", "isActive"],
            },
          ],
        },
      ],
    });

    const children = studentParents.map((sp) => ({
      ...sp.student.toJSON(),
      relationship: sp.relationship,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
