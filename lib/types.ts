
export type Employee = {
  id: string;
  name: string;
  username: string;
  position: string;
  salary: number;
  avatar: string;
  password?: string;
};

export type Attendance = {
  id:string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'Present' | 'Absent' | 'On Leave';
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  leaveType: 'Paid' | 'Unpaid';
  deductionAmount?: number;
};

export type DayDiaryTask = {
  taskName: string;
  description: string;
  plannedHours: string;
  estimatedHours: string;
  status: 'Not Started' | 'On schedule' | 'Behind' | 'Ahead';
};

export type DayDiaryEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD format
  tasks: DayDiaryTask[];
  updatedAt: string; // ISO string
};

export type Project = {
  id: string;
  employeeId: string;
  employeeName: string;
  projectName: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  fileName?: string;
  createdAt: string; // ISO string
};

export type ChatGroup = {
    id: string;
    name: string;
    topic: string;
    createdAt: string; // ISO string
    members: string[]; // Array of employee IDs
};

export type ChatMessage = {
    id: string;
    groupId: string;
    employeeId: string;
    employeeName: string;
    employeeAvatar: string;
    text: string;
    createdAt: string; // ISO string
};

export type AdminProfile = {
  id: string;
  name: string;
  avatar: string;
  username: string;
  password?: string;
};

export type UserChatStatus = {
  userId: string;
  groupId: string;
  lastRead: string; // ISO string
};

export type OfficeSettings = {
  officeLocation: {
    latitude: number;
    longitude: number;
  };
  clockInRadius: number; // in meters
};
