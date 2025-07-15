
import { getDayDiaryEntries, getEmployees } from "@/lib/actions";
import { DiaryReportClient } from "./diary-report-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO } from "date-fns";
import type { Employee } from "@/lib/types";

type DiaryReportPageProps = {
  searchParams: {
    date?: string;
    employeeId?: string;
  };
};

export default async function DiaryReportPage({ searchParams }: DiaryReportPageProps) {
  const { date: dateFilter, employeeId: employeeIdFilter } = searchParams;
  
  const allEntries = await getDayDiaryEntries();
  const employees: Employee[] = await getEmployees();

  const filteredEntries = allEntries.filter((entry) => {
    const dateMatch = !dateFilter || entry.date === dateFilter;
    const employeeMatch = !employeeIdFilter || entry.employeeId === employeeIdFilter;
    return dateMatch && employeeMatch;
  });

  const sortedEntries = filteredEntries.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Suspense fallback={<DiaryReportSkeleton />}>
      <DiaryReportClient
        entries={sortedEntries}
        employees={employees}
        selectedDateString={dateFilter}
        selectedEmployeeId={employeeIdFilter}
      />
    </Suspense>
  );
}

const DiaryReportSkeleton = () => (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Skeleton className="lg:col-span-1 h-[60vh]" />
            <Skeleton className="lg:col-span-3 h-[60vh]" />
        </div>
    </div>
);
