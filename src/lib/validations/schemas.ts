import { z } from "zod";

export const studentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  matricule: z.string().min(3, "Matricule must be at least 3 characters"),
  classId: z.string().min(1, "Please select a class"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(2, "Place of birth is required"),
  gender: z.enum(["Male", "Female"]),
  address: z.string().optional(),
  parentIds: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
});

export const teacherSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(), // Made optional for updates
  phoneNumber: z.string().optional(),
});

export const parentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(), // Made optional for updates
  phoneNumber: z.string().min(9, "Invalid phone number"),
  address: z.string().optional(),
  occupation: z.string().optional(),
  studentIds: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  relationship: z.enum(["Father", "Mother", "Guardian", "Other"]).optional(),
});

export const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  level: z.string().min(2, "Level is required"),
  academicYearId: z.string().min(1, "Please select an academic year"),
  teacherId: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().min(2, "Subject code is required"),
  coefficient: z.number().min(0.5).max(10),
  classId: z.string().min(1, "Please select a class"),
  teacherId: z.string().optional(),
});

export const academicYearSchema = z.object({
  year: z.string().min(7, "Year format should be YYYY/YYYY"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
export type TeacherFormData = z.infer<typeof teacherSchema>;
export type ParentFormData = z.infer<typeof parentSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type AcademicYearFormData = z.infer<typeof academicYearSchema>;
