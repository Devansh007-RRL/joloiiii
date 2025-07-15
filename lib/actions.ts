
'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { getDistance } from 'geolib';
import { getDb } from './db';
import type { Employee, LeaveRequest, Attendance, DayDiaryEntry, DayDiaryTask, ChatGroup, ChatMessage, AdminProfile, UserChatStatus, Project, OfficeSettings } from './types';

// Employee Actions
export async function getEmployees() {
  const db = await getDb();
  return db.data.employees;
}

export async function getEmployeeById(id: string) {
  const db = await getDb();
  return db.data.employees.find((emp) => emp.id === id);
}

export async function addEmployee(employeeData: Omit<Employee, 'id' | 'avatar'>) {
  const db = await getDb();
  const newEmployee: Employee = {
    ...employeeData,
    id: uuidv4(),
    avatar: `https://placehold.co/40x40.png?text=${employeeData.name.charAt(0)}`,
  };
  db.data.employees.push(newEmployee);
  await db.write();
  revalidatePath('/admin', 'layout');
  return newEmployee;
}

export async function updateEmployee(id: string, employeeData: Partial<Omit<Employee, 'id' | 'avatar'>>) {
    const db = await getDb();
    const employeeIndex = db.data.employees.findIndex((emp) => emp.id === id);

    if (employeeIndex !== -1) {
        db.data.employees[employeeIndex] = { ...db.data.employees[employeeIndex], ...employeeData };
        await db.write();
        revalidatePath('/admin', 'layout');
        revalidatePath(`/employee/${id}`, 'layout');
        return db.data.employees[employeeIndex];
    }
    return null;
}

export async function updateEmployeeAvatar(employeeId: string, avatarDataUri: string) {
    const db = await getDb();
    const employeeIndex = db.data.employees.findIndex((emp) => emp.id === employeeId);

    if (employeeIndex !== -1) {
        db.data.employees[employeeIndex].avatar = avatarDataUri;
        await db.write();
        
        revalidatePath(`/employee/${employeeId}/profile`);
        revalidatePath(`/employee/${employeeId}`, 'layout');
        revalidatePath('/admin', 'layout');
        
        return db.data.employees[employeeIndex];
    }
    return null;
}

export async function removeEmployee(id: string) {
  const db = await getDb();
  db.data.employees = db.data.employees.filter((emp) => emp.id !== id);
  db.data.attendance = db.data.attendance.filter((att) => att.employeeId !== id);
  db.data.leaveRequests = db.data.leaveRequests.filter((lr) => lr.employeeId !== id);
  await db.write();
  revalidatePath('/admin', 'layout');
}

export async function clearAllEmployees() {
    const db = await getDb();
    db.data.employees = [];
    db.data.attendance = [];
    db.data.leaveRequests = [];
    db.data.dayDiary = [];
    await db.write();
    revalidatePath('/admin', 'layout');
}

export async function authenticateEmployee(username: string, password?: string) {
  const db = await getDb();
  const employee = db.data.employees.find(
    (emp) => emp.username === username && emp.password === password
  );
  return employee;
}

// Leave Request Actions
export async function getLeaveRequests() {
  const db = await getDb();
  return db.data.leaveRequests;
}

export async function getLeaveRequestsByEmployee(employeeId: string) {
    const db = await getDb();
    return db.data.leaveRequests.filter(lr => lr.employeeId === employeeId);
}

export async function updateLeaveRequestStatus(id: string, status: 'Approved' | 'Rejected', deductionAmount?: number) {
  const db = await getDb();
  const request = db.data.leaveRequests.find((req) => req.id === id);
  if (request) {
    request.status = status;
    
    if (status === 'Approved') {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = format(d, 'yyyy-MM-dd');
            const attendanceRecord = db.data.attendance.find(a => a.employeeId === request.employeeId && a.date === dateStr);
            if (attendanceRecord) {
                attendanceRecord.status = 'On Leave';
            } else {
                db.data.attendance.push({
                    id: uuidv4(),
                    employeeId: request.employeeId,
                    employeeName: request.employeeName,
                    date: dateStr,
                    clockIn: null,
                    clockOut: null,
                    status: 'On Leave'
                });
            }
        }
        
        if (request.leaveType === 'Unpaid' && deductionAmount && deductionAmount > 0) {
            request.deductionAmount = deductionAmount;
        }
    }
    await db.write();
  }
  revalidatePath('/admin', 'layout');

  if (request) {
    revalidatePath(`/employee/${request.employeeId}`, 'layout');
  }
}

export async function applyForLeave(leaveData: Omit<LeaveRequest, 'id' | 'status'>) {
    const db = await getDb();

    if (leaveData.leaveType === 'Paid') {
        const allUserRequests = db.data.leaveRequests.filter(
          (req) => req.employeeId === leaveData.employeeId
        );
        
        const newRequestDate = new Date(leaveData.startDate);
        const newRequestMonth = newRequestDate.getMonth();
        const newRequestYear = newRequestDate.getFullYear();

        const hasTakenPaidLeave = allUserRequests.some(req => {
            if (req.leaveType === 'Paid' && (req.status === 'Approved' || req.status === 'Pending')) {
                const existingRequestDate = new Date(req.startDate);
                const existingRequestMonth = existingRequestDate.getMonth();
                const existingRequestYear = existingRequestDate.getFullYear();
                return existingRequestMonth === newRequestMonth && existingRequestYear === newRequestYear;
            }
            return false;
        });

        if (hasTakenPaidLeave) {
            throw new Error('A paid leave has already been requested or approved for this month.');
        }
    }

    const newRequest: LeaveRequest = {
        ...leaveData,
        id: uuidv4(),
        status: 'Pending',
    };
    db.data.leaveRequests.push(newRequest);
    await db.write();
    revalidatePath(`/employee/${leaveData.employeeId}`, 'layout');
    revalidatePath('/admin', 'layout');
}

// Attendance Actions
export async function getAttendance() {
  const db = await getDb();
  return db.data.attendance;
}

export async function getAttendanceByEmployee(employeeId: string) {
    const db = await getDb();
    return db.data.attendance.filter(a => a.employeeId === employeeId);
}

export async function clockIn(employeeId: string, location: { latitude: number, longitude: number }) {
    const db = await getDb();
    
    // Location validation
    const { settings } = db.data;
    const distance = getDistance(location, settings.officeLocation);

    if (distance > settings.clockInRadius) {
        throw new Error(`You must be within ${settings.clockInRadius} meters of the office to clock in. You are currently ${Math.round(distance)} meters away.`);
    }

    const employee = db.data.employees.find((emp) => emp.id === employeeId);
    if (!employee) throw new Error('Employee not found');
    
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm:ss');

    let attendanceRecord = db.data.attendance.find(a => a.employeeId === employeeId && a.date === today);

    if (attendanceRecord) {
        if (attendanceRecord.clockIn) {
            throw new Error('You have already clocked in today.');
        }
        attendanceRecord.clockIn = currentTime;
        attendanceRecord.status = 'Present';
    } else {
        attendanceRecord = {
            id: uuidv4(),
            employeeId,
            employeeName: employee.name,
            date: today,
            clockIn: currentTime,
            clockOut: null,
            status: 'Present',
        };
        db.data.attendance.push(attendanceRecord);
    }
    await db.write();
    revalidatePath(`/employee/${employeeId}`, 'layout');
    return { time: currentTime };
}

export async function clockOut(employeeId: string) {
    const db = await getDb();
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm:ss');
    
    let attendanceRecord = db.data.attendance.find(a => a.employeeId === employeeId && a.date === today);

    if (attendanceRecord) {
        if (!attendanceRecord.clockIn) {
            throw new Error('You have not clocked in yet.');
        }
        if (attendanceRecord.clockOut) {
            throw new Error('You have already clocked out today.');
        }
        attendanceRecord.clockOut = currentTime;
    } else {
       throw new Error('Cannot clock out without clocking in first.');
    }
    
    await db.write();
    revalidatePath(`/employee/${employeeId}`, 'layout');
    return { time: currentTime };
}

// Day Diary Actions
export async function getDayDiaryEntries() {
  const db = await getDb();
  return db.data.dayDiary;
}

export async function getDayDiaryEntryByEmployeeAndDate(employeeId: string, date: string) {
  const db = await getDb();
  return db.data.dayDiary.find(entry => entry.employeeId === employeeId && entry.date === date);
}

export async function addOrUpdateDayDiaryEntry(data: { employeeId: string, employeeName: string, date: string, tasks: DayDiaryTask[] }) {
    const db = await getDb();
    const { employeeId, date, tasks, employeeName } = data;

    const existingEntryIndex = db.data.dayDiary.findIndex(
        entry => entry.employeeId === employeeId && entry.date === date
    );

    if (existingEntryIndex > -1) {
        db.data.dayDiary[existingEntryIndex].tasks = tasks;
        db.data.dayDiary[existingEntryIndex].updatedAt = new Date().toISOString();
    } else {
        const newEntry: DayDiaryEntry = {
            id: uuidv4(),
            employeeId,
            employeeName,
            date,
            tasks,
            updatedAt: new Date().toISOString(),
        };
        db.data.dayDiary.push(newEntry);
    }

    await db.write();
    revalidatePath(`/employee/${employeeId}/day-diary`);
    revalidatePath('/admin/diary-report');
}

// Project Actions
export async function getProjectsByEmployee(employeeId: string) {
  const db = await getDb();
  return db.data.projects?.filter(p => p.employeeId === employeeId) || [];
}

export async function addProject(projectData: Omit<Project, 'id' | 'createdAt'>) {
    const db = await getDb();
    if (!db.data.projects) {
        db.data.projects = [];
    }
    const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
    };
    db.data.projects.push(newProject);
    await db.write();
    revalidatePath(`/employee/${projectData.employeeId}/projects`);
    return newProject;
}

export async function updateProject(projectId: string, projectData: Partial<Omit<Project, 'id' | 'employeeId' | 'employeeName' | 'createdAt'>>) {
    const db = await getDb();
    const projectIndex = db.data.projects?.findIndex(p => p.id === projectId);

    if (projectIndex !== -1) {
        const employeeId = db.data.projects[projectIndex].employeeId;
        db.data.projects[projectIndex] = { ...db.data.projects[projectIndex], ...projectData };
        await db.write();
        revalidatePath(`/employee/${employeeId}/projects`);
        return db.data.projects[projectIndex];
    }
    return null;
}

export async function deleteProject(projectId: string) {
  const db = await getDb();
  const project = db.data.projects?.find(p => p.id === projectId);
  if (project) {
      db.data.projects = db.data.projects.filter((p) => p.id !== projectId);
      await db.write();
      revalidatePath(`/employee/${project.employeeId}/projects`);
  }
}

// Chat Actions
export async function getChatGroups() {
  const db = await getDb();
  return db.data.chatGroups;
}

export async function getChatGroupsForEmployee(employeeId: string) {
    const db = await getDb();
    return db.data.chatGroups.filter(g => g.members.includes(employeeId));
}

export async function getChatGroupById(id: string) {
    const db = await getDb();
    return db.data.chatGroups.find(g => g.id === id);
}

export async function createChatGroup(name: string, topic: string, memberIds: string[]) {
    const db = await getDb();
    const newGroup: ChatGroup = {
        id: uuidv4(),
        name,
        topic,
        createdAt: new Date().toISOString(),
        members: memberIds,
    };
    db.data.chatGroups.push(newGroup);
    await db.write();
    revalidatePath('/admin', 'layout');
    revalidatePath('/', 'layout');
    return newGroup;
}

export async function updateChatGroup(id: string, name: string, topic: string, memberIds: string[]) {
    const db = await getDb();
    const groupIndex = db.data.chatGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
        throw new Error("Group not found");
    }
    db.data.chatGroups[groupIndex] = {
        ...db.data.chatGroups[groupIndex],
        name,
        topic,
        members: memberIds,
    };
    await db.write();
    revalidatePath('/admin', 'layout');
    revalidatePath('/', 'layout');
}

export async function deleteChatGroup(id: string) {
    const db = await getDb();
    db.data.chatGroups = db.data.chatGroups.filter(g => g.id !== id);
    db.data.chatMessages = db.data.chatMessages.filter(m => m.groupId !== id);
    await db.write();
    revalidatePath('/admin', 'layout');
    revalidatePath('/', 'layout');
}

export async function getMessagesForGroup(groupId: string) {
    const db = await getDb();
    return db.data.chatMessages.filter(m => m.groupId === groupId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function sendMessage(groupId: string, employeeId: string, text: string) {
    const db = await getDb();

    const group = await getChatGroupById(groupId);
    if (!group) {
        throw new Error("Group not found");
    }
    if (!group.members.includes(employeeId)) {
        throw new Error("Access denied. You are not a member of this group.");
    }

    const employee = await getEmployeeById(employeeId);
    if (!employee) {
        throw new Error("Employee not found");
    }
    const newMessage: ChatMessage = {
        id: uuidv4(),
        groupId,
        employeeId,
        employeeName: employee.name,
        employeeAvatar: employee.avatar,
        text,
        createdAt: new Date().toISOString(),
    };
    db.data.chatMessages.push(newMessage);
    await db.write();
    
    revalidatePath(`/admin/chat/${groupId}`);
    group.members.forEach(memberId => {
        revalidatePath(`/employee/${memberId}/chat/${groupId}`);
    });
    // Revalidate layouts to update unread status
    revalidatePath('/admin', 'layout');
    group.members.forEach(memberId => revalidatePath(`/employee/${memberId}`, 'layout'));
}

export async function sendMessageAsAdmin(groupId: string, adminId: string, text: string) {
    const db = await getDb();

    const group = await getChatGroupById(groupId);
    if (!group) throw new Error("Group not found");

    const admin = await getAdminProfileById(adminId);
    if (!admin) throw new Error("Admin not found");

    const newMessage: ChatMessage = {
        id: uuidv4(),
        groupId,
        employeeId: adminId, // Using admin's ID here
        employeeName: `${admin.name} (Admin)`,
        employeeAvatar: admin.avatar,
        text,
        createdAt: new Date().toISOString(),
    };
    db.data.chatMessages.push(newMessage);
    await db.write();

    revalidatePath(`/admin/${adminId}/chat/${groupId}`);
    group.members.forEach(memberId => {
        revalidatePath(`/employee/${memberId}/chat/${groupId}`);
    });
    // Revalidate layouts to update unread status
    revalidatePath(`/admin/${adminId}`, 'layout');
    group.members.forEach(memberId => revalidatePath(`/employee/${memberId}`, 'layout'));
}

export async function getUnreadChatStatus(userId: string): Promise<boolean> {
  const db = await getDb();
  
  const isAdmin = !!db.data.adminProfiles.find(p => p.id === userId);
  const userGroups = isAdmin 
    ? db.data.chatGroups 
    : db.data.chatGroups.filter(g => g.members.includes(userId));

  for (const group of userGroups) {
    const latestMessage = db.data.chatMessages
      .filter(m => m.groupId === group.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .pop();

    if (!latestMessage) {
      continue;
    }

    if (latestMessage.employeeId === userId) {
      continue;
    }

    const userStatus = db.data.userChatStatus.find(s => s.userId === userId && s.groupId === group.id);

    if (!userStatus) {
      return true; // Never read this group, and there's a message from someone else.
    }

    if (new Date(latestMessage.createdAt) > new Date(userStatus.lastRead)) {
      return true; // New message since last read.
    }
  }

  return false;
}

export async function markChatGroupAsRead(userId: string, groupId: string) {
    const db = await getDb();

    if (!db.data.userChatStatus) {
        db.data.userChatStatus = [];
    }

    const statusIndex = db.data.userChatStatus.findIndex(
        s => s.userId === userId && s.groupId === groupId
    );

    const now = new Date().toISOString();

    if (statusIndex > -1) {
        db.data.userChatStatus[statusIndex].lastRead = now;
    } else {
        db.data.userChatStatus.push({ userId, groupId, lastRead: now });
    }

    await db.write();
}


// Admin Actions
export async function getAdminProfileById(id: string) {
  const db = await getDb();
  return db.data.adminProfiles.find(p => p.id === id);
}

export async function updateAdminProfile(id: string, data: Partial<Omit<AdminProfile, 'id' | 'avatar'>>) {
    const db = await getDb();
    const index = db.data.adminProfiles.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error("Admin profile not found.");
    }
    db.data.adminProfiles[index] = { ...db.data.adminProfiles[index], ...data };
    await db.write();
    revalidatePath('/admin', 'layout');
}

export async function updateAdminAvatar(id: string, avatarDataUri: string) {
    const db = await getDb();
    const index = db.data.adminProfiles.findIndex((p) => p.id === id);

    if (index !== -1) {
        db.data.adminProfiles[index].avatar = avatarDataUri;
        await db.write();
        revalidatePath('/admin', 'layout');
        return db.data.adminProfiles[index];
    }
    return null;
}

export async function authenticateAdmin(username: string, password?: string) {
  const db = await getDb();
  const admin = db.data.adminProfiles.find(
    (p) => p.username === username && p.password === password
  );
  return admin;
}

// Data Export Actions
export async function exportAttendanceData(): Promise<string> {
    const attendance = await getAttendance();
    if (!attendance || attendance.length === 0) {
        return "";
    }
    const employees = await getEmployees();
    const employeeMap = new Map(employees.map(e => [e.id, e.username]));

    const exportableData = attendance.map(record => ({
        date: format(new Date(record.date), "MMM d, yyyy"),
        employeeName: record.employeeName,
        username: employeeMap.get(record.employeeId) || 'unknown',
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        status: record.status,
    }));
    
    // Sort data by date descending
    exportableData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return Papa.unparse(exportableData);
}

export async function exportLeaveData(): Promise<string> {
    const leaves = await getLeaveRequests();
    if (!leaves || leaves.length === 0) {
        return "";
    }
    const employees = await getEmployees();
    const employeeMap = new Map(employees.map(e => [e.id, e.username]));
    
    const exportableData = leaves.map(request => ({
        startDate: format(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format(new Date(request.endDate), "MMM d, yyyy"),
        employeeName: request.employeeName,
        username: employeeMap.get(request.employeeId) || 'unknown',
        reason: request.reason,
        leaveType: request.leaveType,
        status: request.status,
        deductionAmount: request.deductionAmount,
    }));

    // Sort data by start date descending
    exportableData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return Papa.unparse(exportableData);
}

// Settings Actions
export async function getOfficeSettings() {
    const db = await getDb();
    return db.data.settings;
}

export async function updateOfficeSettings(settings: OfficeSettings) {
    const db = await getDb();
    db.data.settings = settings;
    await db.write();
    revalidatePath('/admin/settings');
}
