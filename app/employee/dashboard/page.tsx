import { redirect } from 'next/navigation';

// This file is part of a deprecated route that causes a critical routing conflict.
// To resolve this, it now permanently redirects to the home/login page.
export default function DeprecatedEmployeeDashboardPage() {
  redirect('/');
}
