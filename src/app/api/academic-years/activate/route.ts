import { NextRequest, NextResponse } from "next/server";
import { AcademicYear } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function POST(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await request.json();

    // Deactivate all academic years
    await AcademicYear.update({ isActive: false }, { where: {} });

    // Activate the selected one
    const academicYear = await AcademicYear.findByPk(id);
    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    await academicYear.update({ isActive: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error activating academic year:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
