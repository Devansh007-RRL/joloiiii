
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ExportDataClientProps = {
    exportAttendanceAction: () => Promise<string>;
    exportLeaveAction: () => Promise<string>;
}

export function ExportDataClient({ exportAttendanceAction, exportLeaveAction }: ExportDataClientProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [selectedDataType, setSelectedDataType] = useState<string>("");

    const handleExport = async (dataType: 'attendance' | 'leaves') => {
        setIsLoading(prev => ({ ...prev, [dataType]: true }));
        try {
            let csvData: string;
            let fileName: string;

            if (dataType === 'attendance') {
                csvData = await exportAttendanceAction();
                fileName = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
            } else if (dataType === 'leaves') {
                csvData = await exportLeaveAction();
                fileName = `leave_requests_export_${new Date().toISOString().split('T')[0]}.csv`;
            } else {
                throw new Error("Invalid data type for export.");
            }

            if (!csvData) {
                toast({
                    variant: "destructive",
                    title: "No Data to Export",
                    description: `There is no ${dataType} data available to export.`,
                });
                return;
            }

            // Create a Blob from the CSV string
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            
            // Create a link element and trigger the download
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Your ${dataType} data has been downloaded.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred during export.",
            });
        } finally {
            setIsLoading(prev => ({ ...prev, [dataType]: false }));
        }
    };
    
    const exportCards = [
        {
            id: 'attendance',
            title: "Attendance Data",
            description: "Export all historical attendance records, including clock-in/out times and status for every employee.",
            action: () => handleExport('attendance'),
        },
        {
            id: 'leaves',
            title: "Leave Requests",
            description: "Export all historical leave requests, including dates, reasons, status, and any salary deductions.",
            action: () => handleExport('leaves'),
        },
    ];
    
    const selectedData = exportCards.find(c => c.id === selectedDataType);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
                <p className="text-muted-foreground">Download your organization's data as a CSV file for analysis.</p>
            </div>
            
            <div className="block md:hidden">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Data to Export</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={setSelectedDataType} value={selectedDataType}>
                             <SelectTrigger>
                                <SelectValue placeholder="Select a data type..." />
                             </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="attendance">Attendance Data</SelectItem>
                                <SelectItem value="leaves">Leave Requests</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedData && (
                            <div className="mt-4 p-4 border rounded-md bg-muted/50">
                                <p className="text-sm font-medium">{selectedData.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{selectedData.description}</p>
                                <Button
                                    className="mt-4 w-full"
                                    onClick={selectedData.action}
                                    disabled={isLoading[selectedData.id]}
                                >
                                    {isLoading[selectedData.id] ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    {isLoading[selectedData.id] ? 'Exporting...' : 'Export'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exportCards.map((card) => (
                    <Card key={card.id}>
                        <CardHeader>
                            <CardTitle>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                             <Button
                                onClick={card.action}
                                disabled={isLoading[card.id]}
                            >
                                {isLoading[card.id] ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                {isLoading[card.id] ? 'Exporting...' : `Export ${card.title.split(' ')[0]}`}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
