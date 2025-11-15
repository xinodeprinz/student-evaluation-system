import { NextRequest, NextResponse } from "next/server";
import { AcademicYear } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const academicYears = await AcademicYear.findAll({
      order: [["startDate", "DESC"]],
    });

    return NextResponse.json({ academicYears });
  } catch (error) {
    console.error("Error fetching academic years:", error);
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

    // If setting as active, deactivate all others
    if (data.isActive) {
      await AcademicYear.update({ isActive: false }, { where: {} });
    }

    const academicYear = await AcademicYear.create({
      year: data.year,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive || false,
    });

    return NextResponse.json({ academicYear }, { status: 201 });
  } catch (error) {
    console.error("Error creating academic year:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
