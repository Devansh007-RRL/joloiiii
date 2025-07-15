
import { getEmployees, addEmployee, removeEmployee, clearAllEmployees, updateEmployee } from "@/lib/actions";
import { EmployeePageClient } from "./employee-page-client";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <EmployeePageClient 
      employees={employees} 
      addEmployeeAction={addEmployee}
      removeEmployeeAction={removeEmployee}
      clearAllEmployeesAction={clearAllEmployees}
      updateEmployeeAction={updateEmployee}
    />
  );
}
