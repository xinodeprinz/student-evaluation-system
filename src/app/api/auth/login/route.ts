import { NextRequest, NextResponse } from "next/server";
import { User, Student } from "@/lib/db/models";
import { signToken } from "@/lib/utils/auth";
import sequelize from "@/lib/db/config";

export async function POST(request: NextRequest) {
  try {
    await sequelize.authenticate();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let studentProfile = null;
    if (user.role === "student") {
      studentProfile = await Student.findOne({
        where: { userId: user.id },
        attributes: ["id", "matricule", "classId"],
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentProfile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
