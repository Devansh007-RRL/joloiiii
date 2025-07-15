
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmployeeTable } from "@/components/admin/employee-table";
import { AddEmployeeForm } from "@/components/admin/add-employee-form";
import { EditEmployeeForm } from "@/components/admin/edit-employee-form";
import type { Employee } from "@/lib/types";
import { UserPlus, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

type EmployeePageClientProps = {
    employees: Employee[];
    addEmployeeAction: (newEmployeeData: Omit<Employee, 'id' | 'avatar'>) => Promise<Employee>;
    removeEmployeeAction: (id: string) => Promise<void>;
    clearAllEmployeesAction: () => Promise<void>;
    updateEmployeeAction: (id: string, data: Partial<Omit<Employee, 'id' | 'avatar'>>) => Promise<Employee | null>;
}

export function EmployeePageClient({ employees, addEmployeeAction, removeEmployeeAction, clearAllEmployeesAction, updateEmployeeAction }: EmployeePageClientProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const handleClearAll = async () => {
    await clearAllEmployeesAction();
    toast({
        variant: "destructive",
        title: "All Employees Cleared",
        description: "All employee records and their history have been removed.",
    });
    router.refresh();
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
              <p className="text-muted-foreground">View, add, or remove employee profiles.</p>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={employees.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete ALL employee
                            accounts and remove all their attendance and leave data from the servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={handleClearAll}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
            </Button>
          </div>
      </div>
      <EmployeeTable 
        employees={employees} 
        onRemoveEmployee={removeEmployeeAction}
        onEditEmployee={handleEditEmployee}
      />
      <AddEmployeeForm
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddEmployee={addEmployeeAction}
      />
      <EditEmployeeForm
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdateEmployee={updateEmployeeAction}
        employee={selectedEmployee}
      />
    </div>
  );
}
