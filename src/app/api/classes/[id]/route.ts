import { NextRequest, NextResponse } from "next/server";
import { Class } from "@/lib/db/models";
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
    const classItem = await Class.findByPk(id);

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await classItem.update({
      name: data.name,
      level: data.level,
      academicYear: data.academicYear,
      teacherId: data.teacherId || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating class:", error);
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
    const classItem = await Class.findByPk(id);

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await classItem.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
