"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BookOpen, GraduationCap, TrendingUp, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

      // Fetch existing grades
      const gradesRes = await fetch(
        `/api/grades?term=${term}&sequence=${sequence}`,
        { headers: { Authorization: `Bearer ${token}` } }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {user.firstName} {user.lastName}
              </h1>
              <p className="text-yellow-100 mt-1">
                Teacher Dashboard - Grade Management
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Select Class and Subject
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
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
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
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
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
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
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="1">Sequence 1</option>
                <option value="2">Sequence 2</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSubmitGrades}
                disabled={!selectedClass || !selectedSubject}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Grades
              </button>
            </div>
          </div>
        </div>

        {/* Grade Entry Table */}
        {selectedClass && selectedSubject && students.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-6 text-white">
              <h3 className="text-2xl font-bold">Grade Entry</h3>
              <p className="text-green-100 mt-1">
                Term {term} - Sequence {sequence}
              </p>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Score (out of 20)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => {
                      const key = `${student.id}-${selectedSubject}`;
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.matricule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.user.firstName} {student.user.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                              className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                              placeholder="0-20"
                            />
                          </td>
                          <td className="px-6 py-4">
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
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                              placeholder="Enter comment..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No students found in this class
            </p>
          </div>
        )}

        {!selectedClass && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Select a class and subject to start grading
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
