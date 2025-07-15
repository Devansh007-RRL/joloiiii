
import { Suspense } from "react";
import { LeaveRequestsTable } from "@/components/admin/leave-requests-table";
import { getLeaveRequests, updateLeaveRequestStatus } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";

type LeaveRequestPageProps = {
    searchParams: {
        status?: string;
    }
}

export default async function LeaveRequestsPage({ searchParams }: LeaveRequestPageProps) {
  const statusFilter = searchParams.status;
  const leaveRequests = await getLeaveRequests();
  
  const filteredLeaveRequests = statusFilter
    ? leaveRequests.filter(record => record.status === statusFilter)
    : leaveRequests;

  const getPageDescription = () => {
    if (statusFilter) {
        return `Showing all leave requests with status "${statusFilter}".`
    }
    return "Manage all employee leave requests.";
  }

  return (
    <Suspense fallback={
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    }>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
                  <p className="text-muted-foreground">{getPageDescription()}</p>
              </div>
          </div>
          <LeaveRequestsTable leaveRequests={filteredLeaveRequests} onAction={updateLeaveRequestStatus} />
        </div>
    </Suspense>
  );
}
