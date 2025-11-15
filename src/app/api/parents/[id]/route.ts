import { NextRequest, NextResponse } from "next/server";
import { Parent, User, StudentParent } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    const { id } = await params;
    const parent = await Parent.findByPk(id, {
      include: [{ model: User, as: "user" }],
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    };

    // Only update password if provided
    if (data.password && data.password.trim() !== "") {
      updateData.password = data.password;
    }

    // Update user data
    await parent.user?.update(updateData);

    // Update parent data
    await parent.update({
      phoneNumber: data.phoneNumber,
      address: data.address,
      occupation: data.occupation,
    });

    // Update student relationships if provided
    if (data.studentIds !== undefined) {
      // Remove existing relationships
      await StudentParent.destroy({ where: { parentId: parent.id } });

      // Add new relationships
      if (data.studentIds.length > 0) {
        for (const studentId of data.studentIds) {
          await StudentParent.create({
            parentId: parent.id,
            studentId: parseInt(studentId),
            relationship: data.relationship || "Guardian",
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating parent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const parent = await Parent.findByPk(id);

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const userId = parent.userId;
    await parent.destroy();
    await User.destroy({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting parent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
