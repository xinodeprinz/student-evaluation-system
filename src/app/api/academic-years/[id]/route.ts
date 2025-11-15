import { NextRequest, NextResponse } from "next/server";
import { AcademicYear } from "@/lib/db/models";
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
    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    // If setting as active, deactivate all others
    if (data.isActive && !academicYear.isActive) {
      await AcademicYear.update({ isActive: false }, { where: {} });
    }

    await academicYear.update(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating academic year:", error);
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
    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    if (academicYear.isActive) {
      return NextResponse.json(
        { error: "Cannot delete active academic year" },
        { status: 400 }
      );
    }

    await academicYear.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting academic year:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
