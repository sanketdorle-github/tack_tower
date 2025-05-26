
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormItemProps {
  children: ReactNode;
  className?: string;
  label?: string;
  error?: string;
}

const FormItem = ({ children, className, label, error }: FormItemProps) => {
  return (
    <div className={cn("mb-4", className)}>
      {label && <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>}
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormItem;
