
import type { LeaveRequest, Employee, Attendance } from '@/lib/types';
import { getLeaveRequestsByEmployee, getAttendanceByEmployee, applyForLeave, getEmployeeById } from "@/lib/actions";
import { EmployeeDashboardClient } from "@/components/employee/employee-dashboard-client";
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

type EmployeeDashboardPageProps = {
  params: { id: string }
}

// This is now the employee's main dashboard page.
export default async function EmployeeDashboardPage({ params }: EmployeeDashboardPageProps) {
  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }
  
  const [myLeaveRequests, myAttendance] = await Promise.all([
    getLeaveRequestsByEmployee(params.id),
    getAttendanceByEmployee(params.id),
  ]);

  const handleApplyLeave = async (leaveData: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status'>) => {
    "use server";
    const newRequestData = {
        ...leaveData,
        employeeId: employee.id,
        employeeName: employee.name,
    };
    await applyForLeave(newRequestData);
  };
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysAttendance = myAttendance.find(a => a.date === today);
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {employee.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's your personal dashboard.</p>
      </div>
      <EmployeeDashboardClient
          employee={employee}
          myLeaveRequests={myLeaveRequests}
          myAttendance={myAttendance}
          onApplyLeave={handleApplyLeave}
          employeeId={employee.id}
          todaysAttendance={todaysAttendance}
      />
    </div>
  );
}
