
"use client";

import { StatsCard } from "@/components/admin/stats-card";
import { LeaveRequestsTable } from "@/components/admin/leave-requests-table";
import { Users, Plane, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Employee, LeaveRequest } from "@/lib/types";
import { useParams } from "next/navigation";

type AdminDashboardClientProps = {
    employees: Employee[];
    leaveRequests: LeaveRequest[];
    onAction: (id: string, status: 'Approved' | 'Rejected', deductionAmount?: number) => Promise<void>;
    today: string;
    presentToday: number;
    absentToday: number;
}

export function AdminDashboardClient({ 
    employees, 
    leaveRequests, 
    onAction,
    today,
    presentToday,
    absentToday,
}: AdminDashboardClientProps) {
    const params = useParams();
    const adminId = params.id as string;
    const pendingLeaves = leaveRequests.filter(lr => lr.status === 'Pending');
    
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Employees" value={employees.length.toString()} icon={Users} href={`/admin/${adminId}/employees`} />
                <StatsCard title="Present Today" value={presentToday.toString()} icon={CheckCircle2} href={`/admin/${adminId}/attendance?status=Present&date=${today}`} />
                <StatsCard title="Pending Leaves" value={pendingLeaves.length.toString()} icon={Plane} href={`/admin/${adminId}/leaves?status=Pending`} />
                <StatsCard title="Absent Today" value={absentToday.toString()} icon={AlertCircle} href={`/admin/${adminId}/attendance?status=Absent&date=${today}`} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Leave Requests</CardTitle>
                    <CardDescription>Approve or reject recent requests from employees.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaveRequestsTable 
                        leaveRequests={pendingLeaves.slice(0, 5)} 
                        onAction={onAction}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
