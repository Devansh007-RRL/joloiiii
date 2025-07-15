
import { redirect } from 'next/navigation';

type DeprecatedEmployeeDashboardProps = {
    params: { id: string }
}

// This route is deprecated and now permanently redirects to the new, simpler dashboard location at /employee/[id].
export default function DeprecatedEmployeeDashboard({ params }: DeprecatedEmployeeDashboardProps) {
  redirect(`/employee/${params.id}`);
}
