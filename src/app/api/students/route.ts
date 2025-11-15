import { NextRequest, NextResponse } from "next/server";
import {
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

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    if (studentId) {
      const student = await Student.findByPk(studentId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName", "email", "phoneNumber"],
          },
          {
            model: Class,
            as: "class",
            attributes: ["name", "level"],
            include: [{ model: AcademicYear, as: "academicYear" }],
          },
        ],
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ student });
    }

    const whereClause: any = {};
    if (classId) whereClause.classId = classId;

    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: Class,
          as: "class",
          attributes: ["name", "level"],
          include: [{ model: AcademicYear, as: "academicYear" }],
        },
      ],
      order: [["matricule", "ASC"]],
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
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

    // Get active academic year if not provided
    let academicYearId = data.academicYearId;
    if (!academicYearId) {
      const activeYear = await AcademicYear.findOne({
        where: { isActive: true },
      });
      if (!activeYear) {
        return NextResponse.json(
          { error: "No active academic year found" },
          { status: 400 }
        );
      }
      academicYearId = activeYear.id;
    }

    // Generate a random password for the student (won't be used since they don't login)
    const randomPassword = Math.random().toString(36).slice(-8);

    // Create user first
    const user = await User.create({
      email: data.email,
      password: randomPassword, // Random password since students don't login
      firstName: data.firstName,
      lastName: data.lastName,
      role: "student",
      phoneNumber: data.phoneNumber,
    });

    // Create student profile
    const student = await Student.create({
      userId: user.id,
      matricule: data.matricule,
      classId: data.classId,
      dateOfBirth: data.dateOfBirth,
      placeOfBirth: data.placeOfBirth,
      gender: data.gender,
      address: data.address,
      academicYearId: academicYearId,
    });

    // Link to parents if provided
    if (data.parentIds && data.parentIds.length > 0) {
      for (const parentId of data.parentIds) {
        await StudentParent.create({
          studentId: student.id,
          parentId: parseInt(parentId),
          relationship: data.relationship || "Guardian",
        });
      }
    }

    const fullStudent = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email"],
        },
        { model: Class, as: "class", attributes: ["name"] },
      ],
    });

    return NextResponse.json({ student: fullStudent }, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
