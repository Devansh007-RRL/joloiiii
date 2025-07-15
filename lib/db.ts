
import { JSONFilePreset } from 'lowdb/node';
import type { Employee, Attendance, LeaveRequest, DayDiaryEntry, ChatGroup, ChatMessage, AdminProfile, UserChatStatus, Project, OfficeSettings } from './types';
import { v4 as uuidv4 } from 'uuid';

type Data = {
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  dayDiary: DayDiaryEntry[];
  projects: Project[];
  chatGroups: ChatGroup[];
  chatMessages: ChatMessage[];
  adminProfiles: AdminProfile[];
  userChatStatus: UserChatStatus[];
  settings: OfficeSettings;
}

let db: Awaited<ReturnType<typeof JSONFilePreset<Data>>>;
let isInitialized = false;

export async function getDb() {
  const defaultData: Data = {
    employees: [],
    attendance: [],
    leaveRequests: [],
    dayDiary: [],
    projects: [],
    chatGroups: [],
    chatMessages: [],
    adminProfiles: [],
    userChatStatus: [],
    settings: {
        officeLocation: {
            latitude: 19.0760, // Mumbai, India
            longitude: 72.8777
        },
        clockInRadius: 500 // 500 meters
    }
  };

  if (!db) {
    db = await JSONFilePreset<Data>('db.json', defaultData);
  }
  
  await db.read();

  let needsWrite = false;

  // Ensure all top-level keys from defaultData exist in the database file.
  for (const key of Object.keys(defaultData) as Array<keyof Data>) {
    if (!db.data.hasOwnProperty(key)) {
      (db.data as any)[key] = defaultData[key];
      needsWrite = true;
    }
  }

  if (!isInitialized) {
      if (!db.data.adminProfiles || db.data.adminProfiles.length === 0) {
        // This handles migration for old db.json with `adminProfile` or empty `adminProfiles`
        const oldAdminProfile = (db.data as any).adminProfile;
        if (oldAdminProfile && typeof oldAdminProfile === 'object') {
             db.data.adminProfiles = [{
                id: uuidv4(),
                name: oldAdminProfile.name || 'Admin',
                avatar: oldAdminProfile.avatar || 'https://placehold.co/100x100.png',
                username: oldAdminProfile.username || 'admin',
                password: oldAdminProfile.password || 'admin123',
            }];
            delete (db.data as any).adminProfile;
            needsWrite = true;
        } else {
            db.data.adminProfiles = [{ 
                id: uuidv4(),
                name: 'Admin',
                avatar: 'https://placehold.co/100x100.png',
                username: 'admin',
                password: 'admin123'
            }];
            needsWrite = true;
        }
      }
      isInitialized = true;
  }
  
  if (needsWrite) {
      await db.write();
  }

  return db;
}
