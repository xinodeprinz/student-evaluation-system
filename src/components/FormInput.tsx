"use client";

import React from "react";
import { UseFormRegister, FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  min?: string;
  max?: string;
  step?: string;
}

export default function FormInput({
  label,
  name,
  type = "text",
  register,
  error,
  placeholder,
  required = false,
  className = "",
  disabled = false,
  rows,
  options,
  min,
  max,
  step,
}: FormInputProps) {
  const baseInputClasses = `w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
    error
      ? "border-red-500 focus:border-red-600 bg-red-50"
      : "border-gray-200 focus:border-green-500 hover:border-gray-300 bg-white"
  } focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`;

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          {...register(name)}
          rows={rows || 3}
          placeholder={placeholder}
          disabled={disabled}
          className={baseInputClasses}
        />
      ) : type === "select" ? (
        <select
          {...register(name)}
          disabled={disabled}
          className={baseInputClasses}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          {...register(name, { valueAsNumber: type === "number" })}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={baseInputClasses}
        />
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
          {error.message}
        </p>
      )}
    </div>
  );
}
