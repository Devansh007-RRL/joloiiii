
import { getEmployeeById, getDayDiaryEntryByEmployeeAndDate, addOrUpdateDayDiaryEntry } from "@/lib/actions";
import { notFound } from "next/navigation";
import { DayDiaryClient } from "./day-diary-client";
import { format } from "date-fns";
import type { DayDiaryTask } from "@/lib/types";

type DayDiaryPageProps = {
  params: { id: string }
}

export default async function DayDiaryPage({ params }: DayDiaryPageProps) {
  const { id } = params;

  // Add a guard to handle cases where the ID might be undefined during build time.
  if (!id || id === 'undefined') {
    notFound();
  }

  const employee = await getEmployeeById(id);
  if (!employee) {
    notFound();
  }
  
  const now = new Date();
  const entryDate = format(now, 'yyyy-MM-dd');
  const displayDate = format(now, "MMMM dd, yyyy");

  const todaysEntry = await getDayDiaryEntryByEmployeeAndDate(id, entryDate);

  const saveAction = async (tasks: DayDiaryTask[]) => {
    "use server";
    return addOrUpdateDayDiaryEntry({
        employeeId: employee.id,
        employeeName: employee.name,
        date: entryDate,
        tasks
    });
  }

  return (
    <DayDiaryClient 
      initialTasks={todaysEntry?.tasks || []}
      onSave={saveAction}
      entryDate={entryDate}
      displayDate={displayDate}
    />
  );
}
