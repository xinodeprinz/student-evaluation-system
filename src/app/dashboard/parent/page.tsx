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
  Award,
  Users,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { generateReportCard } from "@/lib/utils/pdf";

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [term, setTerm] = useState("1");
  const [sequence, setSequence] = useState("1");
  const [report, setReport] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "parent") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchChildren(token);
  }, []);

  const fetchChildren = async (token: string) => {
    try {
      const response = await fetch("/api/parents/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChildren(data.children);

      if (data.children?.length > 0) {
        setSelectedChild(data.children[0]);
        fetchGrades(token, data.children[0].id);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error("Failed to load children data");
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
    if (selectedChild) {
      const token = localStorage.getItem("token");
      fetchGrades(token!, selectedChild.id);
    }
  }, [term, sequence, selectedChild]);

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

    setDownloading(true);
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
    } finally {
      setDownloading(false);
    }
  };

  const getGradeInfo = (score: number, maxScore: number) => {
    const scoreOn20 = (score / maxScore) * 20;
    let color = "text-red-600 bg-red-100";
    let letter = "F";

    if (scoreOn20 >= 16) {
      color = "text-green-600 bg-green-100";
      letter = "A";
    } else if (scoreOn20 >= 14) {
      color = "text-blue-600 bg-blue-100";
      letter = "B";
    } else if (scoreOn20 >= 12) {
      color = "text-yellow-600 bg-yellow-100";
      letter = "C";
    } else if (scoreOn20 >= 10) {
      color = "text-orange-600 bg-orange-100";
      letter = "D";
    }

    return { color, letter, scoreOn20: scoreOn20.toFixed(1) };
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  if (children?.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
        <Toaster position="top-right" />
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No children linked to your account
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please contact the school administration to link your children to
              your parent account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const average = calculateAverage();
  const avgInfo = getGradeInfo(parseFloat(average as string), 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Toaster position="top-right" />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Parent Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-6 sm:mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome, {user.firstName} {user.lastName}
                </h1>
                <p className="text-purple-100 mt-1 text-sm sm:text-base">
                  Parent Portal - Monitor Your Children's Progress
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    {children?.length}{" "}
                    {children?.length === 1 ? "Child" : "Children"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Children Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Select Child
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children?.map((child) => (
              <motion.button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedChild?.id === child.id
                    ? "border-purple-600 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {child.user.firstName} {child.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{child.class.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {child.matricule}
                      </span>
                      <span className="text-xs text-gray-500">
                        {child.relationship}
                      </span>
                    </div>
                  </div>
                  {selectedChild?.id === child.id && (
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {selectedChild && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Current Average
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2">
                      {average}/20
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${avgInfo.color}`}
                    >
                      Grade {avgInfo.letter}
                    </span>
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Subjects
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2">
                      {grades.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">This period</p>
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Academic Year
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                      {selectedChild.academicYear.year}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedChild.class.level}
                    </p>
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Filters and Download */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Term
                    </label>
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white"
                    >
                      <option value="1">Sequence 1</option>
                      <option value="2">Sequence 2</option>
                    </select>
                  </div>
                </div>

                <div className="lg:w-64">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 invisible lg:visible">
                    Action
                  </label>
                  <button
                    onClick={handleDownloadReport}
                    disabled={grades.length === 0 || downloading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Report Card</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Grades Table */}
            {grades.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {selectedChild.user.firstName}'s Grades
                      </h3>
                      <p className="text-purple-100 mt-1 text-sm sm:text-base">
                        Term {term} - Sequence {sequence}
                      </p>
                    </div>
                    <Award className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Coef.
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="hidden xl:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Comment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {grades.map((grade, index) => {
                          const percentage = (
                            (grade.score / grade.maxScore) *
                            100
                          ).toFixed(1);
                          const gradeInfo = getGradeInfo(
                            grade.score,
                            grade.maxScore
                          );

                          return (
                            <motion.tr
                              key={grade.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-purple-50 transition-colors"
                            >
                              <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                                <div>
                                  {grade.subject.name}
                                  <div className="sm:hidden text-xs text-gray-500 mt-1">
                                    {grade.subject.code} • Coef:{" "}
                                    {grade.subject.coefficient}
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                  {grade.subject.code}
                                </span>
                              </td>
                              <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                {grade.subject.coefficient}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {grade.score.toFixed(1)}/{grade.maxScore}
                                <div className="lg:hidden text-xs text-gray-500 mt-1">
                                  {percentage}%
                                </div>
                              </td>
                              <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-purple-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-semibold">
                                    {percentage}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-bold ${gradeInfo.color}`}
                                >
                                  {gradeInfo.letter}
                                </span>
                              </td>
                              <td className="hidden xl:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600">
                                {grade.comment || "No comment"}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-gray-200">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900 uppercase"
                          >
                            Overall Average
                          </td>
                          <td colSpan={4} className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl sm:text-3xl font-bold text-purple-600">
                                {average}/20
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${avgInfo.color}`}
                              >
                                Grade {avgInfo.letter}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Performance Message */}
                  <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-600">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          Performance Analysis
                        </p>
                        <p className="text-sm text-gray-700">
                          {parseFloat(average as string) >= 16
                            ? "🎉 Excellent performance! Your child is doing outstanding work. Keep encouraging them!"
                            : parseFloat(average as string) >= 14
                            ? "👏 Very good work! Your child is performing well. Continue supporting their efforts!"
                            : parseFloat(average as string) >= 12
                            ? "👍 Good effort! Your child is making progress. Extra study time may help improve further."
                            : parseFloat(average as string) >= 10
                            ? "💪 Fair performance. Consider arranging extra tutorials or study sessions to help improve."
                            : "📚 Your child needs significant support. Please schedule a meeting with their teachers to discuss improvement strategies."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Comments Section */}
                  <div className="xl:hidden mt-6 space-y-3">
                    <h4 className="font-bold text-gray-900 mb-3">
                      Teacher Comments
                    </h4>
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500"
                      >
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {grade.subject.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {grade.comment || "No comment provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center"
              >
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">
                  No grades available for this term and sequence
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Grades will appear here once teachers have entered them
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
