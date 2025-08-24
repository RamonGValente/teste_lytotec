import React from "react";
import { cn } from "@/lib/utils";
export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}
const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  description,
  children
}) => {
  return <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">LYTOTEC ERP</h3>
            <h2 className="text-xl font-medium text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-gray-500">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>;
};
export default AuthLayout;