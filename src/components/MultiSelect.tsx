"use client";

import React from "react";
import Select from "react-select";
import { FieldError } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  value?: Option[];
  onChange: (selected: Option[]) => void;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
  isMulti?: boolean;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  isMulti = true,
}: MultiSelectProps) {
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "48px",
      borderWidth: "2px",
      borderColor: error ? "#ef4444" : state.isFocused ? "#10b981" : "#e5e7eb",
      backgroundColor: error ? "#fef2f2" : "#ffffff",
      boxShadow: "none",
      borderRadius: "12px",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#d1d5db",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#dcfce7",
      borderRadius: "6px",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#166534",
      fontWeight: "600",
      fontSize: "14px",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#166534",
      ":hover": {
        backgroundColor: "#bbf7d0",
        color: "#166534",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#10b981"
        : state.isFocused
        ? "#dcfce7"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#111827",
      fontWeight: state.isSelected ? "600" : "400",
      ":active": {
        backgroundColor: "#10b981",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Select
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={(selected) => onChange(selected as Option[])}
        styles={customStyles}
        placeholder={placeholder || `Select ${label}...`}
        isClearable
        isSearchable
        className="react-select-container"
        classNamePrefix="react-select"
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
          {error.message}
        </p>
      )}
    </div>
  );
}
