
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { LeaveRequest } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

const leaveSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "A start date is required." }),
    to: z.date().optional(),
  }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
  leaveType: z.enum(['Paid', 'Unpaid'], {
    required_error: "You must select a leave type.",
  }),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

type ApplyLeaveFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onApplyLeave: (leaveRequest: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status'>) => Promise<void>;
  myLeaveRequests: LeaveRequest[];
};

export function ApplyLeaveForm({ isOpen, onOpenChange, onApplyLeave, myLeaveRequests }: ApplyLeaveFormProps) {
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      reason: "",
      leaveType: "Unpaid",
    },
  });

  const [isPaidLeaveDisabled, setIsPaidLeaveDisabled] = useState(false);
  const [paidLeaveMessage, setPaidLeaveMessage] = useState('');
  const fromDate = form.watch('dateRange.from');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!fromDate || !myLeaveRequests) {
        setIsPaidLeaveDisabled(false);
        setPaidLeaveMessage('');
        return;
    }
    const newRequestMonth = fromDate.getMonth();
    const newRequestYear = fromDate.getFullYear();
    const hasTakenPaidLeave = myLeaveRequests.some(req => {
        if (req.leaveType === 'Paid' && (req.status === 'Approved' || req.status === 'Pending')) {
            const existingRequestDate = new Date(req.startDate);
            const existingRequestMonth = existingRequestDate.getMonth();
            const existingRequestYear = existingRequestDate.getFullYear();
            return existingRequestMonth === newRequestMonth && existingRequestYear === newRequestYear;
        }
        return false;
    });

    if (hasTakenPaidLeave) {
        setIsPaidLeaveDisabled(true);
        setPaidLeaveMessage('A paid leave has already been used for this month.');
        if (form.getValues('leaveType') === 'Paid') {
            form.setValue('leaveType', 'Unpaid');
        }
    } else {
        setIsPaidLeaveDisabled(false);
        setPaidLeaveMessage('');
    }
  }, [fromDate, myLeaveRequests, form]);

  const onSubmit: SubmitHandler<LeaveFormValues> = async (data) => {
    const { dateRange, reason, leaveType } = data;
    await onApplyLeave({
        startDate: dateRange.from.toISOString(),
        endDate: (dateRange.to || dateRange.from).toISOString(),
        reason,
        leaveType
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>
            Select the dates and provide a reason for your leave.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Leave Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: field.value?.from, to: field.value?.to }}
                        onSelect={field.onChange}
                        initialFocus
                        numberOfMonths={1}
                        disabled={!isClient ? (date) => true : { before: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Leave Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Unpaid" />
                        </FormControl>
                        <Label className="font-normal">Unpaid</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Paid" disabled={isPaidLeaveDisabled}/>
                        </FormControl>
                        <Label className={cn("font-normal", isPaidLeaveDisabled && "text-muted-foreground")}>Paid</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                   {paidLeaveMessage && <p className="text-xs text-destructive">{paidLeaveMessage}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please provide a brief reason for your leave." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
