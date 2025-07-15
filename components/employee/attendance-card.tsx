
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clockIn, clockOut } from '@/lib/actions';
import type { Attendance } from '@/lib/types';

type AttendanceCardProps = {
    employeeId: string;
    todaysAttendance?: Attendance;
}

export function AttendanceCard({ employeeId, todaysAttendance }: AttendanceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isClockedIn = !!(todaysAttendance?.clockIn && !todaysAttendance.clockOut);
  const hasClockedOut = !!todaysAttendance?.clockOut;
  
  const { toast } = useToast();

  const handleClockIn = async () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
        toast({
            variant: "destructive",
            title: "Geolocation Not Supported",
            description: "Your browser does not support location services.",
        });
        setIsLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { time: clockInTime } = await clockIn(employeeId, { latitude, longitude });
          toast({
              title: `Successfully Clocked In`,
              description: `Your time of ${clockInTime} has been recorded.`,
          });
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
      },
      (error) => {
         let description = "An unknown error occurred while getting your location.";
         if (error.code === error.PERMISSION_DENIED) {
            description = "Location access was denied. Please enable location services in your browser settings to clock in.";
         } else if (error.code === error.POSITION_UNAVAILABLE) {
            description = "Your location information is currently unavailable.";
         } else if (error.code === error.TIMEOUT) {
            description = "The request to get your location timed out.";
         }
        
        toast({
            variant: "destructive",
            title: "Geolocation Error",
            description: description,
        });
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    try {
      const { time: clockOutTime } = await clockOut(employeeId);
      toast({
        title: `Successfully Clocked Out`,
        description: `Your time of ${clockOutTime} has been recorded.`,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: unknown) => {
    toast({
        variant: "destructive",
        title: "An error occurred.",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
  
  const getDescription = () => {
      if (isClockedIn) {
          return `You clocked in at ${todaysAttendance?.clockIn}. Clock out when you're done.`
      }
      if (hasClockedOut) {
          return `You clocked out at ${todaysAttendance?.clockOut} today.`
      }
      return "Start your workday by clocking in.";
  }

  const ClockInButton = (
    <Button size="lg" className="w-full max-w-xs" onClick={handleClockIn} disabled={hasClockedOut || isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
      {isLoading ? 'Getting location...' : 'Clock In'}
    </Button>
  );

  const ClockOutButton = (
     <Button size="lg" variant="outline" className="w-full max-w-xs" onClick={handleClockOut} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
        Clock Out
     </Button>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mark Your Attendance</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20 bg-primary/10">
          <Clock className="h-16 w-16 text-primary" />
        </div>
        {isClockedIn ? ClockOutButton : ClockInButton}
      </CardContent>
    </Card>
  );
}
