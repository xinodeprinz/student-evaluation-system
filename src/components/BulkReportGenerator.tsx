"use client";

import React, { useState } from "react";
import { Download, FileText, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { generateReportCard } from "@/lib/utils/pdf";

interface BulkReportGeneratorProps {
  classes: any[];
  academicYears: any[];
}

export default function BulkReportGenerator({
  classes,
  academicYears,
}: BulkReportGeneratorProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [term, setTerm] = useState("1");
  const [sequence, setSequence] = useState("1");
  const [generating, setGenerating] = useState(false);

  const handleGenerateBulkReports = async () => {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }

    setGenerating(true);
    const token = localStorage.getItem("token");

    try {
      const queryParams = new URLSearchParams({
        classId: selectedClass,
        term,
        sequence,
        ...(selectedYear && { academicYearId: selectedYear }),
      });

      const response = await fetch(`/api/reports/bulk?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!data.reports || data.reports.length === 0) {
        toast.error("No reports found for the selected criteria");
        return;
      }

      // Generate individual PDFs and combine or download separately
      toast.success(`Generating ${data.reports.length} report cards...`);

      for (const report of data.reports) {
        const pdf = generateReportCard({
          student: report.student,
          term: report.term,
          sequence: report.sequence,
          grades: report.grades,
          academicYear: report.class.academicYear,
        });

        // Download each PDF
        pdf.save(
          `Report_${report.student.matricule}_T${report.term}S${report.sequence}.pdf`
        );

        // Small delay between downloads to prevent browser blocking
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success(
        `Successfully generated ${data.reports.length} report cards!`
      );
    } catch (error) {
      console.error("Error generating bulk reports:", error);
      toast.error("Failed to generate reports");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8" />
        <div>
          <h3 className="text-2xl font-bold">Bulk Report Generator</h3>
          <p className="text-indigo-100 text-sm">
            Generate and download report cards for entire classes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:border-white/40 focus:outline-none transition-colors"
            >
              <option value="" className="text-gray-900">
                Current Year
              </option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id} className="text-gray-900">
                  {year.year} {year.isActive ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:border-white/40 focus:outline-none transition-colors"
            >
              <option value="" className="text-gray-900">
                Select Class
              </option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="text-gray-900">
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:border-white/40 focus:outline-none transition-colors"
            >
              <option value="1" className="text-gray-900">
                Term 1
              </option>
              <option value="2" className="text-gray-900">
                Term 2
              </option>
              <option value="3" className="text-gray-900">
                Term 3
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Sequence</label>
            <select
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:border-white/40 focus:outline-none transition-colors"
            >
              <option value="1" className="text-gray-900">
                Sequence 1
              </option>
              <option value="2" className="text-gray-900">
                Sequence 2
              </option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateBulkReports}
          disabled={!selectedClass || generating}
          className="w-full flex items-center justify-center gap-3 bg-white text-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {generating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Generating Reports...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Generate All Report Cards</span>
            </>
          )}
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">💡 How it works:</p>
          <ul className="space-y-1 text-indigo-100">
            <li>• Select the class and academic period</li>
            <li>• Click generate to create all report cards</li>
            <li>• PDFs will download automatically for each student</li>
            <li>• You can print or distribute them to parents</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
