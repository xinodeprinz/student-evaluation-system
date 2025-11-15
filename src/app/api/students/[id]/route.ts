import { NextRequest, NextResponse } from "next/server";
import { Student, User, Grade, StudentParent } from "@/lib/db/models";
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
    const student = await Student.findByPk(id, {
      include: [{ model: User, as: "user" }],
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update user data (password not included since students don't login)
    await student.user?.update({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });

    // Update student data
    await student.update({
      matricule: data.matricule,
      classId: data.classId,
      dateOfBirth: data.dateOfBirth,
      placeOfBirth: data.placeOfBirth,
      gender: data.gender,
      address: data.address,
    });

    // Update parent relationships if provided
    if (data.parentIds !== undefined) {
      // Remove existing relationships
      await StudentParent.destroy({ where: { studentId: student.id } });

      // Add new relationships
      if (data.parentIds.length > 0) {
        for (const parentId of data.parentIds) {
          await StudentParent.create({
            studentId: student.id,
            parentId: parseInt(parentId),
            relationship: data.relationship || "Guardian",
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating student:", error);
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
    const student = await Student.findByPk(id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete all grades first
    await Grade.destroy({ where: { studentId: student.id } });

    // Delete student and user
    const userId = student.userId;
    await student.destroy();
    await User.destroy({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
