import { NextRequest, NextResponse } from "next/server";
import { Student, User, Class, Subject, Grade } from "@/lib/db/models";
import { getUserFromRequest } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalStudents = await Student.count();
    const totalTeachers = await User.count({ where: { role: "teacher" } });
    const totalClasses = await Class.count();
    const totalSubjects = await Subject.count();

    // Get recent grades
    const recentGrades = await Grade.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: User, as: "user", attributes: ["firstName", "lastName"] },
          ],
        },
        { model: Subject, as: "subject", attributes: ["name"] },
      ],
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
      },
      recentGrades,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
