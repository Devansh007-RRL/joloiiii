
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AttendanceCard } from "@/components/employee/attendance-card";
import { ApplyLeaveForm } from "@/components/employee/apply-leave-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane } from "lucide-react";
import type { LeaveRequest, Attendance, Employee } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type EmployeeDashboardClientProps = {
    employee: Employee;
    myLeaveRequests: LeaveRequest[];
    myAttendance: Attendance[];
    onApplyLeave: (leaveData: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status'>) => Promise<void>;
    employeeId: string;
    todaysAttendance: Attendance | undefined;
}

export function EmployeeDashboardClient({
    employee,
    myLeaveRequests,
    myAttendance,
    onApplyLeave,
    employeeId,
    todaysAttendance,
}: EmployeeDashboardClientProps) {
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleApplyLeaveSubmit = async (leaveData: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status'>) => {
    try {
        await onApplyLeave(leaveData);
        toast({
            title: "Leave Request Submitted",
            description: "Your request has been sent for approval.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Submitting Leave",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    }
  };

  const getStatusVariant = (status: LeaveRequest['status']): 'default' | 'destructive' | 'secondary' | 'success' => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'default';
    }
  };

  const getAttendanceStatusVariant = (status: Attendance['status']): 'default' | 'destructive' | 'secondary' | 'success' => {
    switch (status) {
        case 'Present': return 'success';
        case 'On Leave': return 'secondary';
        case 'Absent': return 'destructive';
        default: return 'default';
    }
  };

  const recentAttendance = myAttendance.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const sortedLeaveRequests = myLeaveRequests.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0,3);

  const recentDeductions = myLeaveRequests
    .filter(req => req.status === 'Approved' && req.deductionAmount && req.deductionAmount > 0)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Top row for primary actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AttendanceCard
          employeeId={employeeId}
          todaysAttendance={todaysAttendance}
        />
        <Card>
            <CardHeader>
                <CardTitle>Request Leave</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center gap-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 border-8 border-primary/20">
                    <Plane className="h-16 w-16 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                    Need some time off? Submit your leave request here.
                </p>
                <Button onClick={() => setIsApplyLeaveOpen(true)} className="w-full max-w-xs">
                    <Plane className="mr-2 h-4 w-4" />
                    Apply for Leave
                </Button>
            </CardContent>
        </Card>
        <Card className="lg:col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>My Deductions</CardTitle>
                <CardDescription>A summary of your recent salary deductions.</CardDescription>
            </CardHeader>
            <CardContent>
                {recentDeductions.length > 0 ? (
                    <ul className="space-y-1 text-sm pt-4">
                        {recentDeductions.map(req => (
                            <li key={req.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                <div className="text-muted-foreground">
                                    Unpaid Leave ({isClient ? format(parseISO(req.startDate), 'MMM dd') : ''})
                                </div>
                                <div className="font-mono text-destructive font-semibold">
                                    - {isClient ? new Intl.NumberFormat("en-IN", {
                                          style: "currency",
                                          currency: "INR",
                                          minimumFractionDigits: 0,
                                        }).format(req.deductionAmount!) : `INR ${req.deductionAmount}`}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent deductions.</p>
                )}
            </CardContent>
        </Card>
      </div>
      
      {/* Bottom row for summary info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Leave Status</CardTitle>
            <Button asChild variant="link" className="text-sm">
                <Link href={`/employee/${employeeId}/leaves`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {sortedLeaveRequests.map(req => (
                <li key={req.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isClient ? `${format(parseISO(req.startDate), 'MMM dd')} - ${format(parseISO(req.endDate), 'MMM dd')}` : ''} <span className="text-xs text-muted-foreground">({req.leaveType})</span></p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">{req.reason}</p>
                  </div>
                  <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                </li>
              ))}
               {sortedLeaveRequests.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">No recent leave requests.</p>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Attendance</CardTitle>
            <Button asChild variant="link" className="text-sm">
                <Link href={`/employee/${employeeId}/attendance`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentAttendance.map(att => (
                <li key={att.id} className="flex items-center justify-between">
                   <div>
                    <p className="font-medium">{isClient ? format(parseISO(att.date), "EEEE, MMM dd") : ''}</p>
                    <p className="text-sm text-muted-foreground">
                        {att.clockIn && att.clockOut ? `${att.clockIn} - ${att.clockOut}` : 'N/A'}
                    </p>
                  </div>
                  <Badge variant={getAttendanceStatusVariant(att.status)}>{att.status}</Badge>
                </li>
              ))}
               {recentAttendance.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">No recent attendance records.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <ApplyLeaveForm
        isOpen={isApplyLeaveOpen}
        onOpenChange={setIsApplyLeaveOpen}
        onApplyLeave={handleApplyLeaveSubmit}
        myLeaveRequests={myLeaveRequests}
      />
    </div>
  );
}
