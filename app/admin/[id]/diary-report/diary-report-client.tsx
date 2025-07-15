
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, User } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DiaryReportTable } from "@/components/admin/diary-report-table";
import type { DayDiaryEntry, Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type DiaryReportClientProps = {
  entries: DayDiaryEntry[];
  employees: Employee[];
  selectedDateString?: string;
  selectedEmployeeId?: string;
};

export function DiaryReportClient({
  entries,
  employees,
  selectedDateString,
  selectedEmployeeId,
}: DiaryReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const adminId = params.id as string;
  const selectedDate = selectedDateString ? parseISO(selectedDateString) : undefined;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUrlChange = (key: string, value: string | undefined) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/admin/${adminId}/diary-report${query}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    handleUrlChange("date", date ? format(date, "yyyy-MM-dd") : undefined);
    setIsPopoverOpen(false);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    handleUrlChange("employeeId", employeeId);
  };

  const clearFilters = () => {
    router.push(`/admin/${adminId}/diary-report`);
  };

  const getPageDescription = () => {
    if (selectedEmployeeId) {
      const employeeName = employees.find((e) => e.id === selectedEmployeeId)?.name || 'Employee';
       if (selectedDateString) {
        return `Showing entries for ${employeeName} on ${isClient ? format(parseISO(selectedDateString), "MMMM dd, yyyy") : 'a selected date'}.`;
       }
       return `Showing all available entries for ${employeeName}.`;
    }
    if (selectedDateString) {
       return `Showing entries for all employees on ${isClient ? format(parseISO(selectedDateString), "MMMM dd, yyyy") : 'a selected date'}.`;
    }
    return "Select an employee from the list to view their diary entries.";
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Day Diary Report</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        <div className="flex items-center gap-2">
          { (selectedDate || selectedEmployeeId) && (
            <Button variant="link" onClick={clearFilters} className="px-0">
              Clear filters
            </Button>
          )}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open calendar">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={!isClient ? () => true : (date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader className="p-4">
            <CardTitle className="text-xl">Employees</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh]">
              <div className="flex flex-col">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee.id)}
                    className={cn(
                      "flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                      selectedEmployeeId === employee.id && "bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">@{employee.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
          {selectedEmployeeId ? (
            <DiaryReportTable
              entries={entries}
              employeeName={selectedEmployee?.name}
            />
          ) : (
            <Card className="h-full min-h-[60vh] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="mx-auto mb-4 h-12 w-12" />
                <p>Select an employee from the list to see their reports.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
