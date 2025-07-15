"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import type { DayDiaryTask } from "@/lib/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type Props = {
  initialTasks: DayDiaryTask[];
  onSave: (tasks: DayDiaryTask[]) => Promise<void>;
  entryDate: string;
  displayDate: string;
};

export function DayDiaryClient({
  initialTasks,
  onSave,
  entryDate,
  displayDate,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();

  /* ---------- State ---------- */
  const [tasks, setTasks] = useState<DayDiaryTask[]>(initialTasks);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Track “pristine” snapshot to flag unsaved edits ---------- */
  const originalJSON = useRef(JSON.stringify(initialTasks));
  const isDirty = JSON.stringify(tasks) !== originalJSON.current;

  /* ---------- Sync when parent props change ---------- */
  useEffect(() => {
    setTasks(initialTasks);
    originalJSON.current = JSON.stringify(initialTasks);
  }, [initialTasks]);

  /* ---------- Helpers ---------- */
  const handleTaskChange = (
    index: number,
    field: keyof DayDiaryTask,
    value: string,
  ) => {
    if (
      (field === "plannedHours" || field === "estimatedHours") &&
      value &&
      !/^\d*\.?\d*$/.test(value)
    ) {
      return; // allow only numbers + single decimal point
    }
    setTasks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addNewTask = () =>
    setTasks((prev) => [
      ...prev,
      { taskName: "", description: "", plannedHours: "", estimatedHours: "", status: "On schedule" },
    ]);

  const removeTask = (index: number) =>
    setTasks((prev) => prev.filter((_, i) => i !== index));

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // simple required‑field guard
    for (const t of tasks) {
      if (!t.taskName.trim() || !t.description.trim() ||
          !t.plannedHours.trim() || !t.estimatedHours.trim()) {
        toast({
          variant: "destructive",
          title:   "Incomplete Task",
          description: "Fill out every field before saving.",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave(tasks);
      toast({ title: "Saved!", description: "Your progress is stored." });
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title:   "Error",
        description: "Could not save. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Totals ---------- */
  const totalPlanned = tasks.reduce(
    (sum, t) => sum + (parseFloat(t.plannedHours) || 0), 0,
  );
  const totalActual = tasks.reduce(
    (sum, t) => sum + (parseFloat(t.estimatedHours) || 0), 0,
  );

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Work Progress</h1>
        <p className="text-muted-foreground">
          Log your work progress for the day.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>My Report for {displayDate}</CardTitle>
            <CardDescription>
              Add tasks you worked on today. Click “Add Task” for a new row.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/5">Task</TableHead>
                    <TableHead className="w-2/5">Description</TableHead>
                    <TableHead className="w-[13%]">Planned hrs</TableHead>
                    <TableHead className="w-[13%]">Actual hrs</TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {tasks.map((task, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Input
                          value={task.taskName}
                          onChange={(e) =>
                            handleTaskChange(i, "taskName", e.target.value)
                          }
                          placeholder={`Task ${i + 1}`}
                        />
                      </TableCell>

                      <TableCell>
                        <Textarea
                          value={task.description}
                          onChange={(e) =>
                            handleTaskChange(i, "description", e.target.value)
                          }
                          placeholder="Description of work"
                          className="h-16"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={task.plannedHours}
                          onChange={(e) =>
                            handleTaskChange(i, "plannedHours", e.target.value)
                          }
                          placeholder="e.g. 2.5"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={task.estimatedHours}
                          onChange={(e) =>
                            handleTaskChange(i, "estimatedHours", e.target.value)
                          }
                          placeholder="e.g. 3"
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(val) =>
                            handleTaskChange(i, "status", val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="On schedule">On schedule</SelectItem>
                            <SelectItem value="Ahead">Ahead</SelectItem>
                            <SelectItem value="Behind">Behind</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTask(i)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No tasks added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={addNewTask}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Planned:</span>
                <span className="font-semibold">
                  {totalPlanned.toFixed(2)} hrs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Actual:</span>
                <span className="font-semibold">
                  {totalActual.toFixed(2)} hrs
                </span>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="animate-spin mr-2" />}
              {isSubmitting ? "Saving…" : "Save Report"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
