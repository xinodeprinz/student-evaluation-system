"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormInput from "@/components/FormInput";
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
  Search,
  Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  studentSchema,
  teacherSchema,
  classSchema,
  subjectSchema,
  StudentFormData,
  TeacherFormData,
  ClassFormData,
  SubjectFormData,
  ParentFormData,
  parentSchema,
  AcademicYearFormData,
  academicYearSchema,
} from "@/lib/validations/schemas";
import BulkReportGenerator from "@/components/BulkReportGenerator";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    | "student"
    | "teacher"
    | "class"
    | "subject"
    | "academic-year"
    | "parent"
    | ""
  >("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: any;
    type: string;
  }>({
    isOpen: false,
    item: null,
    type: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Form hooks
  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const teacherForm = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  const classForm = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: { academicYear: "2024/2025" },
  });

  const subjectForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { coefficient: 1 },
  });

  const parentForm = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
  });

  const academicYearForm = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
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
      const [
        statsRes,
        studentsRes,
        teachersRes,
        classesRes,
        subjectsRes,
        academicYearsRes,
        parentsRes,
      ] = await Promise.all([
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
        fetch("/api/academic-years", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/parents", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [
        statsData,
        studentsData,
        teachersData,
        classesData,
        subjectsData,
        academicYearsData,
        parentsData,
      ] = await Promise.all([
        statsRes.json(),
        studentsRes.json(),
        teachersRes.json(),
        classesRes.json(),
        subjectsRes.json(),
        academicYearsRes.json(),
        parentsRes.json(),
      ]);

      setStats(statsData.stats);
      setStudents(studentsData.students);
      setTeachers(teachersData.teachers);
      setClasses(classesData.classes);
      setSubjects(subjectsData.subjects);
      setAcademicYears(academicYearsData.academicYears);
      setParents(parentsData.parents);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (
    type:
      | "student"
      | "teacher"
      | "class"
      | "subject"
      | "academic-year"
      | "parent"
  ) => {
    setEditingItem(null);
    setModalType(type);
    setShowModal(true);
    // Reset all forms
    studentForm.reset({
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
    teacherForm.reset();
    classForm.reset({ academicYear: "2024/2025" });
    subjectForm.reset({ coefficient: 1 });
    parentForm.reset();
    academicYearForm.reset();
  };

  const openEditModal = (
    item: any,
    type:
      | "student"
      | "teacher"
      | "class"
      | "subject"
      | "academic-year"
      | "parent"
  ) => {
    setEditingItem(item);
    setModalType(type);
    setShowModal(true);

    if (type === "student") {
      studentForm.reset({
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        email: item.user.email,
        password: "",
        phoneNumber: item.user.phoneNumber || "",
        matricule: item.matricule,
        classId: item.classId.toString(),
        dateOfBirth: new Date(item.dateOfBirth).toISOString().split("T")[0],
        placeOfBirth: item.placeOfBirth,
        gender: item.gender,
        parentName: item.parentName || "",
        parentPhone: item.parentPhone || "",
        address: item.address || "",
      });
    } else if (type === "teacher") {
      teacherForm.reset({
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        password: "",
        phoneNumber: item.phoneNumber || "",
      });
    } else if (type === "class") {
      classForm.reset({
        name: item.name,
        level: item.level,
        academicYear: item.academicYear,
        teacherId: item.teacherId?.toString() || "",
      });
    } else if (type === "subject") {
      subjectForm.reset({
        name: item.name,
        code: item.code,
        coefficient: item.coefficient,
        classId: item.classId.toString(),
        teacherId: item.teacherId?.toString() || "",
      });
    } else if (type === "parent") {
      parentForm.reset({
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        email: item.user.email,
        password: "",
        phoneNumber: item.phoneNumber || "",
        address: item.address || "",
        occupation: item.occupation || "",
      });
    } else if (type === "academic-year") {
      academicYearForm.reset({
        year: item.year,
        startDate: new Date(item.startDate).toISOString().split("T")[0],
        endDate: new Date(item.endDate).toISOString().split("T")[0],
        isActive: item.isActive,
      });
    }
  };

  const handleCreateStudent = async (data: StudentFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create student");

      toast.success("Student created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to create student");
    }
  };

  const handleUpdateStudent = async (data: StudentFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/students/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update student");

      toast.success("Student updated successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to update student");
    }
  };

  const handleCreateTeacher = async (data: TeacherFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create teacher");

      toast.success("Teacher created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to create teacher");
    }
  };

  const handleUpdateTeacher = async (data: TeacherFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/teachers/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update teacher");

      toast.success("Teacher updated successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to update teacher");
    }
  };

  const handleCreateClass = async (data: ClassFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create class");

      toast.success("Class created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to create class");
    }
  };

  const handleUpdateClass = async (data: ClassFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/classes/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update class");

      toast.success("Class updated successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to update class");
    }
  };

  const handleCreateSubject = async (data: SubjectFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create subject");

      toast.success("Subject created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to create subject");
    }
  };

  const handleUpdateSubject = async (data: SubjectFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/subjects/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update subject");

      toast.success("Subject updated successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to update subject");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    const { item, type } = deleteDialog;

    try {
      const endpoints: any = {
        student: `/api/students/${item.id}`,
        teacher: `/api/teachers/${item.id}`,
        class: `/api/classes/${item.id}`,
        subject: `/api/subjects/${item.id}`,
      };

      const response = await fetch(endpoints[type], {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to delete ${type}`);

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`
      );
      fetchDashboardData(token!);
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const filteredStudents = students?.filter((student) =>
    `${student.user.firstName} ${student.user.lastName} ${student.matricule}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.firstName} ${teacher.lastName} ${teacher.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredClasses = classes?.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.code}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  const handleCreateParent = async (data: ParentFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/parents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create parent");

      toast.success("Parent created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to create parent");
    }
  };

  const handleUpdateParent = async (data: ParentFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/parents/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update parent");

      toast.success("Parent updated successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to update parent");
    }
  };

  const handleCreateAcademicYear = async (data: AcademicYearFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/academic-years", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create academic year");

      toast.success("Academic year created successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to create academic year");
    }
  };

  const handleUpdateAcademicYear = async (data: AcademicYearFormData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/academic-years/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update academic year");

      toast.success("Academic year updated successfully!");
      setShowModal(false);
      fetchDashboardData(token!);
    } catch (error) {
      toast.error("Failed to update academic year");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Toaster position="top-right" />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                  Total Students
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                  Total Teachers
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats?.totalTeachers || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                  Total Classes
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats?.totalClasses || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                  Total Subjects
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats?.totalSubjects || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              {[
                "overview",
                "students",
                "teachers",
                "classes",
                "subjects",
                "academic-years",
                "parents",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "border-b-4 border-green-600 text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Dashboard Overview
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-shadow">
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 mb-4" />
                    <h4 className="text-lg sm:text-xl font-bold mb-2">
                      Academic Performance
                    </h4>
                    <p className="text-green-100 text-sm sm:text-base">
                      Monitor student progress and generate comprehensive
                      reports for the academic year 2024/2025.
                    </p>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="mt-4 bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-sm"
                    >
                      View Students
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-shadow">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 mb-4" />
                    <h4 className="text-lg sm:text-xl font-bold mb-2">
                      Quick Actions
                    </h4>
                    <div className="space-y-2 mt-4">
                      <button
                        onClick={() => openCreateModal("student")}
                        className="w-full bg-white text-yellow-600 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors text-sm"
                      >
                        Add New Student
                      </button>
                      <button
                        onClick={() => openCreateModal("teacher")}
                        className="w-full bg-white text-yellow-600 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors text-sm"
                      >
                        Add New Teacher
                      </button>
                      <button
                        onClick={() => openCreateModal("class")}
                        className="w-full bg-white text-yellow-600 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors text-sm"
                      >
                        Add New Class
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Report Generator */}
                <BulkReportGenerator
                  classes={classes}
                  academicYears={academicYears}
                />
              </motion.div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Students Management
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => openCreateModal("student")}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow-lg rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-green-50 to-yellow-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Matricule
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Class
                            </th>
                            <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredStudents?.map((student, index) => (
                            <motion.tr
                              key={student.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-green-50 transition-colors"
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.matricule}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-green-600 font-bold text-sm">
                                      {student.user.firstName[0]}
                                      {student.user.lastName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.user.firstName}{" "}
                                      {student.user.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500 md:hidden">
                                      {student.class.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                  {student.class.name}
                                </span>
                              </td>
                              <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {student.user.email}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      openEditModal(student, "student")
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteDialog({
                                        isOpen: true,
                                        item: student,
                                        type: "student",
                                      })
                                    }
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {filteredStudents?.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No students found</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Teachers Tab */}
            {activeTab === "teachers" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Teachers Management
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => openCreateModal("teacher")}
                      className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Teacher</span>
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all hover:border-yellow-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {teacher.firstName[0]}
                            {teacher.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">
                            {teacher.firstName} {teacher.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">Teacher</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <p className="text-gray-600 truncate">
                          <span className="font-semibold">Email:</span>{" "}
                          {teacher.email}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Phone:</span>{" "}
                          {teacher.phoneNumber || "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(teacher, "teacher")}
                          className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              item: teacher,
                              type: "teacher",
                            })
                          }
                          className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTeachers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No teachers found</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Classes Tab */}
            {activeTab === "classes" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Classes Management
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => openCreateModal("class")}
                      className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Class</span>
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredClasses?.map((classItem, index) => (
                    <motion.div
                      key={classItem.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all hover:border-red-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <School className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg truncate">
                            {classItem.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {classItem.level}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <p className="text-gray-600">
                          <span className="font-semibold">Academic Year:</span>{" "}
                          {classItem.academicYear}
                        </p>
                        <p className="text-gray-600 truncate">
                          <span className="font-semibold">Class Teacher:</span>{" "}
                          {classItem.teacher
                            ? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                            : "Not Assigned"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(classItem, "class")}
                          className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              item: classItem,
                              type: "class",
                            })
                          }
                          className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredClasses?.length === 0 && (
                  <div className="text-center py-12">
                    <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No classes found</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Subjects Tab */}
            {activeTab === "subjects" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Subjects Management
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => openCreateModal("subject")}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Subject</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow-lg rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Code
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Class
                            </th>
                            <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Coefficient
                            </th>
                            <th className="hidden xl:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Teacher
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredSubjects.map((subject, index) => (
                            <motion.tr
                              key={subject.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                  {subject.code}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {subject.name}
                                </div>
                                <div className="text-xs text-gray-500 md:hidden">
                                  {subject.class.name} • Coef:{" "}
                                  {subject.coefficient}
                                </div>
                              </td>
                              <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                                  {subject.class.name}
                                </span>
                              </td>
                              <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {subject.coefficient}
                              </td>
                              <td className="hidden xl:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {subject.teacher
                                  ? `${subject.teacher.firstName} ${subject.teacher.lastName}`
                                  : "Not Assigned"}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      openEditModal(subject, "subject")
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteDialog({
                                        isOpen: true,
                                        item: subject,
                                        type: "subject",
                                      })
                                    }
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {filteredSubjects.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No subjects found</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Academic Years Tab */}
            {activeTab === "academic-years" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Academic Years Management
                  </h3>
                  <button
                    onClick={() => openCreateModal("academic-year")}
                    className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Academic Year</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {academicYears.map((year, index) => (
                    <motion.div
                      key={year.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all ${
                        year.isActive
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${
                            year.isActive
                              ? "bg-gradient-to-br from-green-400 to-green-600"
                              : "bg-gradient-to-br from-indigo-400 to-indigo-600"
                          }`}
                        >
                          <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg truncate">
                            {year.year}
                          </h4>
                          {year.isActive && (
                            <span className="inline-block mt-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <p className="text-gray-600">
                          <span className="font-semibold">Start:</span>{" "}
                          {new Date(year.startDate).toLocaleDateString("en-GB")}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">End:</span>{" "}
                          {new Date(year.endDate).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!year.isActive && (
                          <button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              try {
                                const response = await fetch(
                                  "/api/academic-years/activate",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ id: year.id }),
                                  }
                                );
                                if (!response.ok)
                                  throw new Error("Failed to activate");
                                toast.success("Academic year activated!");
                                fetchDashboardData(token!);
                              } catch (error) {
                                toast.error("Failed to activate academic year");
                              }
                            }}
                            className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(year, "academic-year")}
                          className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                        >
                          Edit
                        </button>
                        {!year.isActive && (
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                item: year,
                                type: "academic-year",
                              })
                            }
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {academicYears.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No academic years found
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Parents Tab */}
            {activeTab === "parents" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Parents Management
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search parents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => openCreateModal("parent")}
                      className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Parent</span>
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {parents
                    .filter((parent) =>
                      `${parent.user.firstName} ${parent.user.lastName} ${parent.user.email}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((parent, index) => (
                      <motion.div
                        key={parent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all hover:border-purple-300"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {parent.user.firstName[0]}
                              {parent.user.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">
                              {parent.user.firstName} {parent.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">Parent</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <p className="text-gray-600 truncate">
                            <span className="font-semibold">Email:</span>{" "}
                            {parent.user.email}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Phone:</span>{" "}
                            {parent.phoneNumber || "N/A"}
                          </p>
                          {parent.occupation && (
                            <p className="text-gray-600">
                              <span className="font-semibold">Occupation:</span>{" "}
                              {parent.occupation}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(parent, "parent")}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                item: parent,
                                type: "parent",
                              })
                            }
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {parents.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No parents found</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${editingItem ? "Edit" : "Add New"} ${
          modalType.charAt(0).toUpperCase() + modalType.slice(1)
        }`}
        size="lg"
      >
        {modalType === "student" && (
          <form
            onSubmit={studentForm.handleSubmit(
              editingItem ? handleUpdateStudent : handleCreateStudent
            )}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="firstName"
                register={studentForm.register}
                error={studentForm.formState.errors.firstName}
                required
              />
              <FormInput
                label="Last Name"
                name="lastName"
                register={studentForm.register}
                error={studentForm.formState.errors.lastName}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Email"
                name="email"
                type="email"
                register={studentForm.register}
                error={studentForm.formState.errors.email}
                required
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                register={studentForm.register}
                error={studentForm.formState.errors.password}
                required={!editingItem}
                placeholder={editingItem ? "Leave blank to keep current" : ""}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Matricule"
                name="matricule"
                register={studentForm.register}
                error={studentForm.formState.errors.matricule}
                required
              />
              <FormInput
                label="Phone Number"
                name="phoneNumber"
                register={studentForm.register}
                error={studentForm.formState.errors.phoneNumber}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                register={studentForm.register}
                error={studentForm.formState.errors.dateOfBirth}
                required
              />
              <FormInput
                label="Place of Birth"
                name="placeOfBirth"
                register={studentForm.register}
                error={studentForm.formState.errors.placeOfBirth}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Gender"
                name="gender"
                type="select"
                register={studentForm.register}
                error={studentForm.formState.errors.gender}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                required
              />
              <FormInput
                label="Class"
                name="classId"
                type="select"
                register={studentForm.register}
                error={studentForm.formState.errors.classId}
                options={classes?.map((cls) => ({
                  value: cls.id.toString(),
                  label: cls.name,
                }))}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Parent Name"
                name="parentName"
                register={studentForm.register}
                error={studentForm.formState.errors.parentName}
              />
              <FormInput
                label="Parent Phone"
                name="parentPhone"
                register={studentForm.register}
                error={studentForm.formState.errors.parentPhone}
              />
            </div>

            <FormInput
              label="Address"
              name="address"
              type="textarea"
              register={studentForm.register}
              error={studentForm.formState.errors.address}
              rows={3}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                {editingItem ? "Update Student" : "Create Student"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {modalType === "teacher" && (
          <form
            onSubmit={teacherForm.handleSubmit(
              editingItem ? handleUpdateTeacher : handleCreateTeacher
            )}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="firstName"
                register={teacherForm.register}
                error={teacherForm.formState.errors.firstName}
                required
              />
              <FormInput
                label="Last Name"
                name="lastName"
                register={teacherForm.register}
                error={teacherForm.formState.errors.lastName}
                required
              />
            </div>

            <FormInput
              label="Email"
              name="email"
              type="email"
              register={teacherForm.register}
              error={teacherForm.formState.errors.email}
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              register={teacherForm.register}
              error={teacherForm.formState.errors.password}
              required={!editingItem}
              placeholder={editingItem ? "Leave blank to keep current" : ""}
            />

            <FormInput
              label="Phone Number"
              name="phoneNumber"
              register={teacherForm.register}
              error={teacherForm.formState.errors.phoneNumber}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors shadow-lg"
              >
                {editingItem ? "Update Teacher" : "Create Teacher"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {modalType === "class" && (
          <form
            onSubmit={classForm.handleSubmit(
              editingItem ? handleUpdateClass : handleCreateClass
            )}
            className="space-y-4"
          >
            <FormInput
              label="Class Name"
              name="name"
              register={classForm.register}
              error={classForm.formState.errors.name}
              placeholder="e.g., Form 5A"
              required
            />

            <FormInput
              label="Level"
              name="level"
              register={classForm.register}
              error={classForm.formState.errors.level}
              placeholder="e.g., Upper Sixth"
              required
            />

            <FormInput
              label="Academic Year"
              name="academicYear"
              register={classForm.register}
              error={classForm.formState.errors.academicYear}
              placeholder="e.g., 2024/2025"
              required
            />

            <FormInput
              label="Class Teacher"
              name="teacherId"
              type="select"
              register={classForm.register}
              error={classForm.formState.errors.teacherId}
              options={teachers.map((teacher) => ({
                value: teacher.id.toString(),
                label: `${teacher.firstName} ${teacher.lastName}`,
              }))}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg"
              >
                {editingItem ? "Update Class" : "Create Class"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {modalType === "subject" && (
          <form
            onSubmit={subjectForm.handleSubmit(
              editingItem ? handleUpdateSubject : handleCreateSubject
            )}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Subject Name"
                name="name"
                register={subjectForm.register}
                error={subjectForm.formState.errors.name}
                placeholder="e.g., Mathematics"
                required
              />
              <FormInput
                label="Subject Code"
                name="code"
                register={subjectForm.register}
                error={subjectForm.formState.errors.code}
                placeholder="e.g., MATH"
                required
              />
            </div>

            <FormInput
              label="Coefficient"
              name="coefficient"
              type="number"
              register={subjectForm.register}
              error={subjectForm.formState.errors.coefficient}
              min="0.5"
              max="10"
              step="0.5"
              required
            />

            <FormInput
              label="Class"
              name="classId"
              type="select"
              register={subjectForm.register}
              error={subjectForm.formState.errors.classId}
              options={classes?.map((cls) => ({
                value: cls.id.toString(),
                label: cls.name,
              }))}
              required
            />

            <FormInput
              label="Teacher"
              name="teacherId"
              type="select"
              register={subjectForm.register}
              error={subjectForm.formState.errors.teacherId}
              options={teachers.map((teacher) => ({
                value: teacher.id.toString(),
                label: `${teacher.firstName} ${teacher.lastName}`,
              }))}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg"
              >
                {editingItem ? "Update Subject" : "Create Subject"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {modalType === "parent" && (
          <form
            onSubmit={parentForm.handleSubmit(
              editingItem ? handleUpdateParent : handleCreateParent
            )}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="firstName"
                register={parentForm.register}
                error={parentForm.formState.errors.firstName}
                required
              />
              <FormInput
                label="Last Name"
                name="lastName"
                register={parentForm.register}
                error={parentForm.formState.errors.lastName}
                required
              />
            </div>

            <FormInput
              label="Email"
              name="email"
              type="email"
              register={parentForm.register}
              error={parentForm.formState.errors.email}
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              register={parentForm.register}
              error={parentForm.formState.errors.password}
              required={!editingItem}
              placeholder={editingItem ? "Leave blank to keep current" : ""}
            />

            <FormInput
              label="Phone Number"
              name="phoneNumber"
              register={parentForm.register}
              error={parentForm.formState.errors.phoneNumber}
              placeholder="+237 6XX XXX XXX"
              required
            />

            <FormInput
              label="Occupation"
              name="occupation"
              register={parentForm.register}
              error={parentForm.formState.errors.occupation}
            />

            <FormInput
              label="Address"
              name="address"
              type="textarea"
              register={parentForm.register}
              error={parentForm.formState.errors.address}
              rows={2}
            />

            {!editingItem && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Link to Students (Optional)
                  </label>
                  <select
                    multiple
                    {...parentForm.register("studentIds")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    size={5}
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName} -{" "}
                        {student.matricule}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>

                <FormInput
                  label="Relationship"
                  name="relationship"
                  type="select"
                  register={parentForm.register}
                  error={parentForm.formState.errors.relationship}
                  options={[
                    { value: "Father", label: "Father" },
                    { value: "Mother", label: "Mother" },
                    { value: "Guardian", label: "Guardian" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors shadow-lg"
              >
                {editingItem ? "Update Parent" : "Create Parent"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {modalType === "academic-year" && (
          <form
            onSubmit={academicYearForm.handleSubmit(
              editingItem ? handleUpdateAcademicYear : handleCreateAcademicYear
            )}
            className="space-y-4"
          >
            <FormInput
              label="Academic Year"
              name="year"
              register={academicYearForm.register}
              error={academicYearForm.formState.errors.year}
              placeholder="e.g., 2024/2025"
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                name="startDate"
                type="date"
                register={academicYearForm.register}
                error={academicYearForm.formState.errors.startDate}
                required
              />
              <FormInput
                label="End Date"
                name="endDate"
                type="date"
                register={academicYearForm.register}
                error={academicYearForm.formState.errors.endDate}
                required
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <input
                type="checkbox"
                {...academicYearForm.register("isActive")}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <div>
                <label className="font-semibold text-gray-900 cursor-pointer">
                  Set as Active Academic Year
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  This will deactivate all other academic years
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors shadow-lg"
              >
                {editingItem ? "Update Academic Year" : "Create Academic Year"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null, type: "" })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type}?`}
        message={`Are you sure you want to delete this ${deleteDialog.type}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
