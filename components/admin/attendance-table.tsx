"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Attendance } from "@/lib/types";
import { format, parseISO } from "date-fns";

type AttendanceTableProps = {
  attendanceRecords: Attendance[];
};

export function AttendanceTable({ attendanceRecords }: AttendanceTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getStatusVariant = (status: Attendance['status']) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'On Leave':
        return 'secondary';
      case 'Absent':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendanceRecords.length > 0 ? (
            attendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.employeeName}</TableCell>
                <TableCell>{isClient ? format(parseISO(record.date), "MMM d, yyyy") : record.date}</TableCell>
                <TableCell>{record.clockIn ?? 'N/A'}</TableCell>
                <TableCell>{record.clockOut ?? 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No attendance records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
