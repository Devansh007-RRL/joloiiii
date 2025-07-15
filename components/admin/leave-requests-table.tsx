
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import type { LeaveRequest } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type LeaveRequestsTableProps = {
  leaveRequests: LeaveRequest[];
  onAction?: (id: string, status: 'Approved' | 'Rejected', deductionAmount?: number) => Promise<void>;
};

export function LeaveRequestsTable({ leaveRequests, onAction }: LeaveRequestsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [deductionAmount, setDeductionAmount] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getStatusVariant = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const handleAction = async (id: string, status: 'Approved' | 'Rejected', deductionAmount?: number) => {
    if (!onAction) return;
    await onAction(id, status, deductionAmount);
    toast({
      title: `Request ${status}`,
      description: `The leave request has been ${status.toLowerCase()}${deductionAmount ? ` with a salary deduction of ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(deductionAmount)}` : ''}.`,
    });
    if (selectedRequest) {
        setSelectedRequest(null);
        setDeductionAmount('');
    }
    router.refresh();
  }

  const handleApproveClick = (request: LeaveRequest) => {
    if (request.leaveType === 'Unpaid' && onAction) {
        setSelectedRequest(request);
    } else {
        handleAction(request.id, 'Approved');
    }
  }

  const handleDialogClose = () => {
    setSelectedRequest(null);
    setDeductionAmount('');
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              {onAction && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length > 0 ? (
              leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.employeeName}</TableCell>
                  <TableCell>
                    {isClient ? `${format(parseISO(request.startDate), "MMM d, yyyy")} - ${format(parseISO(request.endDate), "MMM d, yyyy")}` : `${request.startDate} - ${request.endDate}`}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={request.leaveType === 'Paid' ? 'default' : 'secondary'}>{request.leaveType}</Badge>
                      {request.deductionAmount && request.deductionAmount > 0 ? (
                          <div className="text-xs text-destructive">
                              {isClient ? 
                                `(${new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 0,
                                }).format(request.deductionAmount)} deducted)`
                                : `(INR ${request.deductionAmount} deducted)`
                              }
                          </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                  {onAction && (
                      <TableCell className="text-right">
                      {request.status === 'Pending' && (
                          <div className="space-x-2">
                          <Button
                              variant="ghost"
                              size="icon"
                              className="text-success hover:text-success"
                              onClick={() => handleApproveClick(request)}
                          >
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleAction(request.id, 'Rejected')}
                          >
                              <XCircle className="h-5 w-5" />
                              <span className="sr-only">Reject</span>
                          </Button>
                          </div>
                      )}
                      </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={onAction ? 6 : 5} className="h-24 text-center">
                  No leave requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedRequest && (
         <AlertDialog open={!!selectedRequest} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Approve Unpaid Leave for {selectedRequest.employeeName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This is an unpaid leave request. You can approve it with or without a salary deduction. Please specify the amount to deduct if applicable.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2 space-y-2">
                    <Label htmlFor="deduction-amount">Deduction Amount (INR)</Label>
                    <Input 
                        id="deduction-amount"
                        type="number"
                        placeholder="e.g. 5000"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleDialogClose}>Cancel</AlertDialogCancel>
                    <Button variant="outline" onClick={() => handleAction(selectedRequest.id, 'Approved')}>
                        Approve Only
                    </Button>
                    <AlertDialogAction 
                        onClick={() => handleAction(selectedRequest.id, 'Approved', Number(deductionAmount))}
                        disabled={!deductionAmount || Number(deductionAmount) <= 0}
                    >
                        Approve & Deduct Salary
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
