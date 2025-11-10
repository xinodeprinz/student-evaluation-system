"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  Plus,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  // Form states
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    matricule: "",
    classId: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "Male",
    parentName: "",
    parentPhone: "",
    address: "",
  });

  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [classForm, setClassForm] = useState({
    name: "",
    level: "",
    academicYear: "2025/2026",
    teacherId: "",
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    coefficient: 1,
    classId: "",
    teacherId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const [statsRes, studentsRes, teachersRes, classesRes, subjectsRes] =
        await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/teachers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/classes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/subjects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const statsData = await statsRes.json();
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      const classesData = await classesRes.json();
      const subjectsData = await subjectsRes.json();

      setStats(statsData.stats);
      setStudents(studentsData.students);
      setTeachers(teachersData.teachers);
      setClasses(classesData.classes);
      setSubjects(subjectsData.subjects);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentForm),
      });

      if (!response.ok) throw new Error("Failed to create student");

      toast.success("Student created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
      resetForms();
    } catch (error) {
      toast.error("Failed to create student");
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teacherForm),
      });

      if (!response.ok) throw new Error("Failed to create teacher");

      toast.success("Teacher created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
      resetForms();
    } catch (error) {
      toast.error("Failed to create teacher");
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classForm),
      });

      if (!response.ok) throw new Error("Failed to create class");

      toast.success("Class created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
      resetForms();
    } catch (error) {
      toast.error("Failed to create class");
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subjectForm),
      });

      if (!response.ok) throw new Error("Failed to create subject");

      toast.success("Subject created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
      resetForms();
    } catch (error) {
      toast.error("Failed to create subject");
    }
  };

  const resetForms = () => {
    setStudentForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      matricule: "",
      classId: "",
      dateOfBirth: "",
      placeOfBirth: "",
      gender: "Male",
      parentName: "",
      parentPhone: "",
      address: "",
    });
    setTeacherForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
    });
    setClassForm({
      name: "",
      level: "",
      academicYear: "2025/2026",
      teacherId: "",
    });
    setSubjectForm({
      name: "",
      code: "",
      coefficient: 1,
      classId: "",
      teacherId: "",
    });
  };

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Toaster position="top-right" />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Total Teachers
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalTeachers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Total Classes
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalClasses || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Total Subjects
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalSubjects || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {["overview", "students", "teachers", "classes", "subjects"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "border-b-4 border-green-600 text-green-600 bg-green-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Dashboard Overview
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <TrendingUp className="w-8 h-8 mb-4" />
                    <h4 className="text-xl font-bold mb-2">
                      Academic Performance
                    </h4>
                    <p className="text-green-100">
                      Monitor student progress and generate comprehensive
                      reports for the academic year 2025/2026.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                    <FileText className="w-8 h-8 mb-4" />
                    <h4 className="text-xl font-bold mb-2">Quick Actions</h4>
                    <div className="space-y-2 mt-4">
                      <button
                        onClick={() => openModal("student")}
                        className="w-full bg-white text-yellow-600 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
                      >
                        Add New Student
                      </button>
                      <button
                        onClick={() => openModal("teacher")}
                        className="w-full bg-white text-yellow-600 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
                      >
                        Add New Teacher
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Students Management
                  </h3>
                  <button
                    onClick={() => openModal("student")}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Student
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Matricule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.matricule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.user.firstName} {student.user.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.class.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.user.phoneNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Teachers Tab */}
            {activeTab === "teachers" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Teachers Management
                  </h3>
                  <button
                    onClick={() => openModal("teacher")}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Teacher
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">Teacher</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-semibold">Email:</span>{" "}
                          {teacher.email}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Phone:</span>{" "}
                          {teacher.phoneNumber || "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
                          Edit
                        </button>
                        <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Classes Tab */}
            {activeTab === "classes" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Classes Management
                  </h3>
                  <button
                    onClick={() => openModal("class")}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Class
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <School className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {classItem.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {classItem.level}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-semibold">Academic Year:</span>{" "}
                          {classItem.academicYear}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Class Teacher:</span>{" "}
                          {classItem.teacher
                            ? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                            : "Not Assigned"}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
                          Edit
                        </button>
                        <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subjects Tab */}
            {activeTab === "subjects" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Subjects Management
                  </h3>
                  <button
                    onClick={() => openModal("subject")}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Coefficient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Teacher
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {subjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subject.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subject.class.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subject.coefficient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {subject.teacher
                              ? `${subject.teacher.firstName} ${subject.teacher.lastName}`
                              : "Not Assigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-yellow-500 p-6 text-white">
              <h3 className="text-2xl font-bold">
                Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
            </div>

            <div className="p-6">
              {modalType === "student" && (
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={studentForm.firstName}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={studentForm.lastName}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={studentForm.email}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={studentForm.password}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Matricule
                      </label>
                      <input
                        type="text"
                        value={studentForm.matricule}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            matricule: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={studentForm.phoneNumber}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={studentForm.dateOfBirth}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        value={studentForm.placeOfBirth}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            placeOfBirth: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={studentForm.gender}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            gender: e.target.value as "Male" | "Female",
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Class
                      </label>
                      <select
                        value={studentForm.classId}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            classId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Parent Name
                      </label>
                      <input
                        type="text"
                        value={studentForm.parentName}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            parentName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Parent Phone
                      </label>
                      <input
                        type="text"
                        value={studentForm.parentPhone}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            parentPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={studentForm.address}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Create Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {modalType === "teacher" && (
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={teacherForm.firstName}
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={teacherForm.lastName}
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={teacherForm.password}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={teacherForm.phoneNumber}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      Create Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {modalType === "class" && (
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      value={classForm.name}
                      onChange={(e) =>
                        setClassForm({ ...classForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="e.g., Form 5A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Level
                    </label>
                    <input
                      type="text"
                      value={classForm.level}
                      onChange={(e) =>
                        setClassForm({ ...classForm, level: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="e.g., Upper Sixth"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={classForm.academicYear}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          academicYear: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class Teacher
                    </label>
                    <select
                      value={classForm.teacherId}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          teacherId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Create Class
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {modalType === "subject" && (
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        value={subjectForm.name}
                        onChange={(e) =>
                          setSubjectForm({
                            ...subjectForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        placeholder="e.g., Mathematics"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject Code
                      </label>
                      <input
                        type="text"
                        value={subjectForm.code}
                        onChange={(e) =>
                          setSubjectForm({
                            ...subjectForm,
                            code: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        placeholder="e.g., MATH"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coefficient
                    </label>
                    <input
                      type="number"
                      value={subjectForm.coefficient}
                      onChange={(e) =>
                        setSubjectForm({
                          ...subjectForm,
                          coefficient: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      min="1"
                      step="0.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      value={subjectForm.classId}
                      onChange={(e) =>
                        setSubjectForm({
                          ...subjectForm,
                          classId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teacher
                    </label>
                    <select
                      value={subjectForm.teacherId}
                      onChange={(e) =>
                        setSubjectForm({
                          ...subjectForm,
                          teacherId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Create Subject
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
