"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  BookOpen,
  GraduationCap,
  FileText,
  Save,
  TrendingUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [term, setTerm] = useState("1");
  const [sequence, setSequence] = useState("1");
  const [grades, setGrades] = useState<{
    [key: string]: { score: number; comment: string };
  }>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "teacher") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/classes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classesData = await classesRes.json();
      const subjectsData = await subjectsRes.json();

      setClasses(classesData.classes);
      setSubjects(subjectsData.subjects);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/students?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStudents(data.students);

      const gradesRes = await fetch(
        `/api/grades?term=${term}&sequence=${sequence}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const gradesData = await gradesRes.json();

      const gradesMap: { [key: string]: { score: number; comment: string } } =
        {};
      gradesData.grades.forEach((grade: any) => {
        const key = `${grade.studentId}-${grade.subjectId}`;
        gradesMap[key] = { score: grade.score, comment: grade.comment || "" };
      });
      setGrades(gradesMap);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass, term, sequence]);

  const handleGradeChange = (
    studentId: number,
    field: "score" | "comment",
    value: string
  ) => {
    const key = `${studentId}-${selectedSubject}`;
    setGrades((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === "score" ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const handleSubmitGrades = async () => {
    const token = localStorage.getItem("token");
    const selectedStudents = students.filter(
      (s) => grades[`${s.id}-${selectedSubject}`]?.score !== undefined
    );

    if (selectedStudents.length === 0) {
      toast.error("Please enter at least one grade");
      return;
    }

    setSaving(true);
    try {
      for (const student of selectedStudents) {
        const key = `${student.id}-${selectedSubject}`;
        const gradeData = grades[key];

        if (gradeData && gradeData.score !== undefined) {
          await fetch("/api/grades", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentId: student.id,
              subjectId: selectedSubject,
              term: parseInt(term),
              sequence: parseInt(sequence),
              score: gradeData.score,
              maxScore: 20,
              comment: gradeData.comment || "",
            }),
          });
        }
      }

      toast.success("Grades submitted successfully!");
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast.error("Failed to submit grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  const classSubjects = subjects.filter(
    (s) => s.classId === parseInt(selectedClass)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Toaster position="top-right" />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome, {user.firstName} {user.lastName}
              </h1>
              <p className="text-yellow-100 mt-1 text-sm sm:text-base">
                Teacher Dashboard - Grade Management
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Select Class and Subject
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject("");
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white"
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
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white disabled:bg-gray-100"
                disabled={!selectedClass}
              >
                <option value="">Select Subject</option>
                {classSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white"
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sequence
              </label>
              <select
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white"
              >
                <option value="1">Sequence 1</option>
                <option value="2">Sequence 2</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSubmitGrades}
                disabled={!selectedClass || !selectedSubject || saving}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Submit Grades</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grade Entry Table */}
        {selectedClass && selectedSubject && students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">Grade Entry</h3>
                  <p className="text-green-100 mt-1 text-sm sm:text-base">
                    Term {term} - Sequence {sequence}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-yellow-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Matricule
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Student Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Score (out of 20)
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => {
                      const key = `${student.id}-${selectedSubject}`;
                      return (
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
                                <span className="text-green-600 font-bold text-xs sm:text-sm">
                                  {student.user.firstName[0]}
                                  {student.user.lastName[0]}
                                </span>
                              </div>
                              <div className="text-sm text-gray-900">
                                {student.user.firstName} {student.user.lastName}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={grades[key]?.score || ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  student.id,
                                  "score",
                                  e.target.value
                                )
                              }
                              className="w-20 sm:w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                              placeholder="0-20"
                            />
                          </td>
                          <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                            <input
                              type="text"
                              value={grades[key]?.comment || ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  student.id,
                                  "comment",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                              placeholder="Enter comment..."
                            />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Comments Section */}
              <div className="md:hidden mt-6 space-y-4">
                <h4 className="font-bold text-gray-900 mb-3">Comments</h4>
                {students.map((student) => {
                  const key = `${student.id}-${selectedSubject}`;
                  return (
                    <div key={student.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        {student.user.firstName} {student.user.lastName}
                      </p>
                      <input
                        type="text"
                        value={grades[key]?.comment || ""}
                        onChange={(e) =>
                          handleGradeChange(
                            student.id,
                            "comment",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="Enter comment..."
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {selectedClass && students.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center"
          >
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No students found in this class
            </p>
          </motion.div>
        )}

        {!selectedClass && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Select a class and subject to start grading
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Choose from the dropdowns above to view students
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
