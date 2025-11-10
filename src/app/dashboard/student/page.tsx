"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  Download,
  FileText,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { generateReportCard } from "@/lib/utils/pdf";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [term, setTerm] = useState("1");
  const [sequence, setSequence] = useState("1");
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "student") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchData(token, parsedUser);
  }, []);

  const fetchData = async (token: string, userData: any) => {
    try {
      const studentRes = await fetch(
        `/api/students?studentId=${userData.studentProfile.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const studentData = await studentRes.json();
      setStudentData(studentData.student);

      fetchGrades(token, userData.studentProfile.id);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async (token: string, studentId: number) => {
    try {
      const gradesRes = await fetch(
        `/api/grades?studentId=${studentId}&term=${term}&sequence=${sequence}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const gradesData = await gradesRes.json();
      setGrades(gradesData.grades);

      // Fetch report data
      const reportRes = await fetch(
        `/api/reports?studentId=${studentId}&term=${term}&sequence=${sequence}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reportData = await reportRes.json();
      setReport(reportData.report);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  useEffect(() => {
    if (user && studentData) {
      const token = localStorage.getItem("token");
      fetchGrades(token!, user.studentProfile.id);
    }
  }, [term, sequence]);

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const totalWeightedScore = grades.reduce(
      (sum, g) => sum + (g.score / g.maxScore) * 20 * g.subject.coefficient,
      0
    );
    const totalCoefficient = grades.reduce(
      (sum, g) => sum + g.subject.coefficient,
      0
    );
    return totalCoefficient > 0
      ? (totalWeightedScore / totalCoefficient).toFixed(2)
      : 0;
  };

  const handleDownloadReport = () => {
    if (!report) {
      toast.error("No report data available");
      return;
    }

    try {
      const pdf = generateReportCard({
        student: report.student,
        term: report.term,
        sequence: report.sequence,
        grades: report.grades,
        academicYear: report.class.academicYear,
      });

      pdf.save(
        `Report_${report.student.matricule}_T${report.term}S${report.sequence}.pdf`
      );
      toast.success("Report card downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report card");
    }
  };

  if (loading || !user || !studentData) {
    return <LoadingSpinner />;
  }

  const average = calculateAverage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Toaster position="top-right" />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {studentData.user.firstName} {studentData.user.lastName}
                </h1>
                <p className="text-green-100 mt-1">
                  Matricule: {studentData.matricule}
                </p>
                <p className="text-green-100">
                  Class: {studentData.class.name}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Date of Birth
              </p>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(studentData.dateOfBirth).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Place of Birth
              </p>
              <p className="text-gray-900 font-medium mt-1">
                {studentData.placeOfBirth}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Gender</p>
              <p className="text-gray-900 font-medium mt-1">
                {studentData.gender}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Current Average
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {average}/20
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Subjects</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {grades.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Academic Year
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {studentData.class.academicYear}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Download */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
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

            <div className="flex-1 min-w-[200px]">
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

            <div className="flex-1 min-w-[200px] flex items-end">
              <button
                onClick={handleDownloadReport}
                disabled={grades.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download Report Card
              </button>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        {grades.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-6 text-white">
              <h3 className="text-2xl font-bold">Your Grades</h3>
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
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Coefficient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grades.map((grade) => {
                      const percentage = (
                        (grade.score / grade.maxScore) *
                        100
                      ).toFixed(1);
                      const scoreOn20 = (
                        (grade.score / grade.maxScore) *
                        20
                      ).toFixed(1);
                      let gradeColor = "text-red-600";
                      let gradeLetter = "F";

                      if (parseFloat(scoreOn20) >= 16) {
                        gradeColor = "text-green-600";
                        gradeLetter = "A";
                      } else if (parseFloat(scoreOn20) >= 14) {
                        gradeColor = "text-blue-600";
                        gradeLetter = "B";
                      } else if (parseFloat(scoreOn20) >= 12) {
                        gradeColor = "text-yellow-600";
                        gradeLetter = "C";
                      } else if (parseFloat(scoreOn20) >= 10) {
                        gradeColor = "text-orange-600";
                        gradeLetter = "D";
                      }

                      return (
                        <tr key={grade.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {grade.subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {grade.subject.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grade.subject.coefficient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {grade.score.toFixed(1)}/{grade.maxScore}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${gradeColor} bg-opacity-10`}
                              style={{
                                backgroundColor: `${gradeColor.replace(
                                  "text-",
                                  ""
                                )}15`,
                              }}
                            >
                              {gradeLetter}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {grade.comment || "No comment"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-sm font-bold text-gray-900 uppercase"
                      >
                        Overall Average
                      </td>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-2xl font-bold text-green-600"
                      >
                        {average}/20
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Performance Message */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border-l-4 border-green-600">
                <p className="text-sm font-semibold text-gray-700">
                  {parseFloat(average as string) >= 16
                    ? "🎉 Excellent performance! Keep up the outstanding work!"
                    : parseFloat(average as string) >= 14
                    ? "👏 Very good work! You are doing great!"
                    : parseFloat(average as string) >= 12
                    ? "👍 Good effort! Keep pushing forward!"
                    : parseFloat(average as string) >= 10
                    ? "💪 Fair performance. More effort needed!"
                    : "📚 You need to work harder. Consult your teachers for help."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No grades available for this term and sequence
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
