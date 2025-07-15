
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
import type { DayDiaryEntry } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";


type DiaryReportTableProps = {
  entries: DayDiaryEntry[];
  employeeName?: string;
};

export function DiaryReportTable({ entries, employeeName }: DiaryReportTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "success" => {
    switch (status) {
      case 'On schedule': return 'success';
      case 'Ahead': return 'default';
      case 'Behind': return 'destructive';
      case 'Not Started': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Report for {employeeName}</CardTitle>
        <CardDescription>
          {entries.length > 0
            ? "Showing submitted reports for this employee, sorted by most recent."
            : `No reports found for ${employeeName} on the selected date.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[55vh] pr-4">
            <div className="space-y-6">
            {entries.length > 0 ? (
                entries.map((entry) => {
                  return (
                    <div key={entry.id} className="rounded-lg border">
                        <div className="flex justify-between items-center p-4 bg-muted/50 border-b">
                            <h3 className="font-semibold">{isClient ? format(parseISO(entry.date), "EEEE, MMMM dd, yyyy") : entry.date}</h3>
                            <div className="flex items-center gap-4">
                                <p className="text-xs text-muted-foreground">Updated: {isClient ? format(parseISO(entry.updatedAt), "p") : ''}</p>
                            </div>
                        </div>
                        {entry.tasks && entry.tasks.length > 0 ? (
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Planned (hrs)</TableHead>
                                    <TableHead className="text-center">Actual (hrs)</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {entry.tasks.map((task, index) => (
                                    <TableRow key={index} className="hover:bg-muted/20">
                                    <TableCell className="font-medium">{task.taskName}</TableCell>
                                    <TableCell className="text-muted-foreground">{task.description}</TableCell>
                                    <TableCell className="text-center">{task.plannedHours}</TableCell>
                                    <TableCell className="text-center">{task.estimatedHours}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground">No tasks were reported for this day.</div>
                        )}
                    </div>
                  )
                })
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-16">
                    <FileText className="h-12 w-12 mb-4" />
                    <p>No entries found for {employeeName}.</p>
                    <p className="text-xs">Try selecting a different date.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
