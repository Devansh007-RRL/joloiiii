
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AttendanceTable } from "@/components/admin/attendance-table";
import type { Attendance } from "@/lib/types";

type AttendancePageClientProps = {
  attendanceRecords: Attendance[];
  pageDescription: string;
  selectedDateString?: string;
};

export function AttendancePageClient({ attendanceRecords, pageDescription, selectedDateString }: AttendancePageClientProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const adminId = params.id as string;
  const selectedDate = selectedDateString ? new Date(selectedDateString) : undefined;
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleDateSelect = (date: Date | undefined) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (date) {
      current.set("date", format(date, "yyyy-MM-dd"));
    } else {
      current.delete("date");
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/admin/${adminId}/attendance${query}`);
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Report</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
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
      <AttendanceTable attendanceRecords={attendanceRecords} />
    </div>
  );
}
