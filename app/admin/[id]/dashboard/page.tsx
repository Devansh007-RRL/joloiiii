
import { getEmployees, getLeaveRequests, getAttendance, updateLeaveRequestStatus } from "@/lib/actions";
import { AdminDashboardClient } from "./admin-dashboard-client";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
  const [employees, leaveRequests, attendance] = await Promise.all([
    getEmployees(),
    getLeaveRequests(),
    getAttendance(),
  ]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const presentToday = attendance.filter(a => a.date === today && a.status === 'Present').length;
  const absentToday = employees.length - presentToday;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">A quick overview of your organization's status.</p>
      </div>
      <AdminDashboardClient 
        employees={employees}
        leaveRequests={leaveRequests}
        onAction={updateLeaveRequestStatus}
        today={today}
        presentToday={presentToday}
        absentToday={absentToday}
      />
    </div>
  );
}
