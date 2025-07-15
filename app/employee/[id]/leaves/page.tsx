import { getLeaveRequestsByEmployee } from "@/lib/actions";
import { LeaveRequestsTable } from "@/components/admin/leave-requests-table";

type EmployeeLeavesPageProps = {
  params: { id: string }
}

export default async function EmployeeLeavesPage({ params }: EmployeeLeavesPageProps) {
  const leaveRequests = await getLeaveRequestsByEmployee(params.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Leave Requests</h1>
        <p className="text-muted-foreground">View your complete leave request history.</p>
      </div>
      <LeaveRequestsTable leaveRequests={leaveRequests.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())} />
    </div>
  );
}
