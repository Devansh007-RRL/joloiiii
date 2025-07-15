
import { Suspense } from "react";
import { getAttendance } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePageClient } from "./attendance-page-client";

type AttendancePageProps = {
    searchParams: {
        status?: string;
        date?: string;
    }
}

async function AttendancePageComponent({ statusFilter, dateFilter }: { statusFilter?: string, dateFilter?: string }) {
  const attendanceRecords = await getAttendance();

  const filteredAttendance = attendanceRecords.filter(record => {
      const statusMatch = !statusFilter || record.status === statusFilter;
      const dateMatch = !dateFilter || record.date === dateFilter;
      return statusMatch && dateMatch;
  });
  
  const getPageDescription = () => {
    try {
      if (statusFilter && dateFilter) {
          return `Showing "${statusFilter}" employees for ${format(parseISO(dateFilter), 'MMM dd, yyyy')}.`
      }
      if (statusFilter) {
          return `Showing all employees with status "${statusFilter}".`
      }
      if (dateFilter) {
          return `Showing all records for ${format(parseISO(dateFilter), 'MMM dd, yyyy')}.`
      }
    } catch (e) {
      return "View all employee attendance records.";
    }
    return "View all employee attendance records.";
  }

  return (
    <AttendancePageClient
      attendanceRecords={filteredAttendance}
      pageDescription={getPageDescription()}
      selectedDateString={dateFilter}
    />
  );
}

export default function AttendancePage({ searchParams }: AttendancePageProps) {
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
            <AttendancePageComponent statusFilter={searchParams.status} dateFilter={searchParams.date} />
        </Suspense>
    )
}
