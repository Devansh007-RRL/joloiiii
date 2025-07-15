import React from 'react';

// This is a pass-through layout to resolve a routing conflict and ensure
// the Next.js build process remains stable.
export default function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
