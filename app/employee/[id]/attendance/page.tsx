import { getAttendanceByEmployee } from "@/lib/actions";
import { AttendanceTable } from "@/components/admin/attendance-table";

type EmployeeAttendancePageProps = {
  params: { id: string }
}

export default async function EmployeeAttendancePage({ params }: EmployeeAttendancePageProps) {
  const attendanceRecords = await getAttendanceByEmployee(params.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">View your complete attendance record.</p>
      </div>
      <AttendanceTable attendanceRecords={attendanceRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())} />
    </div>
  );
}
