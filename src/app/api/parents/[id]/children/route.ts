import { NextRequest, NextResponse } from "next/server";
import { StudentParent, Student, User, Class } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentParents = await StudentParent.findAll({
      where: { parentId: id },
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
            { model: Class, as: "class", attributes: ["name"] },
          ],
        },
      ],
    });

    const children = studentParents.map((sp) => ({
      id: sp.studentId,
      matricule: sp.student.matricule,
      user: sp.student.user,
      class: sp.student.class,
      relationship: sp.relationship,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
