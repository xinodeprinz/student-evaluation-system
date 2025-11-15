import { NextRequest, NextResponse } from "next/server";
import { StudentParent, Parent, User } from "@/lib/db/models";
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
      where: { studentId: id },
      include: [
        {
          model: Parent,
          as: "parent",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName", "email"],
            },
          ],
        },
      ],
    });

    const parents = studentParents.map((sp) => ({
      id: sp.parentId,
      user: sp.parent.user,
      relationship: sp.relationship,
    }));

    return NextResponse.json({ parents });
  } catch (error) {
    console.error("Error fetching student parents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
