
import { exportAttendanceData, exportLeaveData } from "@/lib/actions";
import { ExportDataClient } from "./export-data-client";

export default function ExportDataPage() {
    return (
        <ExportDataClient 
            exportAttendanceAction={exportAttendanceData}
            exportLeaveAction={exportLeaveData}
        />
    )
}
