/**
 * System Permissions Constants
 * Defines all available permissions in the system for role-based access control
 */

// Permission categories
export const PermissionCategory = {
	USERS: 'users',
	SCHOOLS: 'schools',
	STUDENTS: 'students',
	LEVELS: 'levels',
	BRANCHES: 'branches',
	ROLES: 'roles',
	REPORTS: 'reports',
	SETTINGS: 'settings',
	CLASSES: 'classes',
	TEACHERS: 'teachers',
	COURSES: 'courses',
	GRADES: 'grades',
	ATTENDANCE: 'attendance',
	PAYMENTS: 'payments',
	ANNOUNCEMENTS: 'announcements',
	CALENDAR: 'calendar',
	MESSAGES: 'messages',
	IT: 'it'
} as const;

export type PermissionCategoryType = (typeof PermissionCategory)[keyof typeof PermissionCategory];

// Permission actions
export const PermissionAction = {
	CREATE: 'create',
	READ: 'read',
	UPDATE: 'update',
	DELETE: 'delete',
	MANAGE: 'manage',
	EXPORT: 'export',
	IMPORT: 'import',
	APPROVE: 'approve',
	ASSIGN: 'assign',
	ASSIGN_STUDENTS: 'assign_students',
	VIEW: 'view'
} as const;

export type PermissionActionType = (typeof PermissionAction)[keyof typeof PermissionAction];

/**
 * System Permissions
 * Format: CATEGORY_ACTION
 * These match the database permissions from public_permissions_export
 */
export const SystemPermission = {
	// Users
	USERS_CREATE: 'users:create',
	USERS_READ: 'users:read',
	USERS_UPDATE: 'users:update',
	USERS_DELETE: 'users:delete',
	USERS_MANAGE: 'users:manage',

	// Schools
	SCHOOLS_CREATE: 'schools:create',
	SCHOOLS_READ: 'schools:read',
	SCHOOLS_UPDATE: 'schools:update',
	SCHOOLS_DELETE: 'schools:delete',
	SCHOOLS_MANAGE: 'schools:manage',

	// Students
	STUDENTS_CREATE: 'students:create',
	STUDENTS_READ: 'students:read',
	STUDENTS_UPDATE: 'students:update',
	STUDENTS_DELETE: 'students:delete',
	STUDENTS_MANAGE: 'students:manage',
	STUDENTS_EXPORT: 'students:export',
	STUDENTS_IMPORT: 'students:import',

	// Levels
	LEVELS_CREATE: 'levels:create',
	LEVELS_READ: 'levels:read',
	LEVELS_UPDATE: 'levels:update',
	LEVELS_DELETE: 'levels:delete',
	LEVELS_ASSIGN_STUDENTS: 'levels:assign_students',

	// Branches
	BRANCHES_CREATE: 'branches:create',
	BRANCHES_READ: 'branches:read',
	BRANCHES_UPDATE: 'branches:update',
	BRANCHES_DELETE: 'branches:delete',
	BRANCHES_ASSIGN_STUDENTS: 'branches:assign_students',

	// Roles & Permissions
	ROLES_CREATE: 'roles:create',
	ROLES_READ: 'roles:read',
	ROLES_UPDATE: 'roles:update',
	ROLES_DELETE: 'roles:delete',
	ROLES_ASSIGN: 'roles:assign',
	ROLES_MANAGE: 'roles:manage',

	// Reports
	REPORTS_VIEW: 'reports:view',
	REPORTS_EXPORT: 'reports:export',
	REPORTS_CREATE: 'reports:create',
	REPORTS_READ: 'reports:read',
	REPORTS_MANAGE: 'reports:manage',

	// Settings
	SETTINGS_READ: 'settings:read',
	SETTINGS_UPDATE: 'settings:update',
	SETTINGS_MANAGE: 'settings:manage',

	// Classes
	CLASSES_CREATE: 'classes:create',
	CLASSES_READ: 'classes:read',
	CLASSES_UPDATE: 'classes:update',
	CLASSES_DELETE: 'classes:delete',
	CLASSES_MANAGE: 'classes:manage',

	// Teachers
	TEACHERS_CREATE: 'teachers:create',
	TEACHERS_READ: 'teachers:read',
	TEACHERS_UPDATE: 'teachers:update',
	TEACHERS_DELETE: 'teachers:delete',
	TEACHERS_MANAGE: 'teachers:manage',

	// Courses
	COURSES_CREATE: 'courses:create',
	COURSES_READ: 'courses:read',
	COURSES_UPDATE: 'courses:update',
	COURSES_DELETE: 'courses:delete',
	COURSES_MANAGE: 'courses:manage',

	// Grades
	GRADES_CREATE: 'grades:create',
	GRADES_READ: 'grades:read',
	GRADES_UPDATE: 'grades:update',
	GRADES_DELETE: 'grades:delete',
	GRADES_MANAGE: 'grades:manage',
	GRADES_EXPORT: 'grades:export',
	GRADES_APPROVE: 'grades:approve',

	// Attendance
	ATTENDANCE_CREATE: 'attendance:create',
	ATTENDANCE_READ: 'attendance:read',
	ATTENDANCE_UPDATE: 'attendance:update',
	ATTENDANCE_DELETE: 'attendance:delete',
	ATTENDANCE_MANAGE: 'attendance:manage',
	ATTENDANCE_EXPORT: 'attendance:export',

	// Payments
	PAYMENTS_CREATE: 'payments:create',
	PAYMENTS_READ: 'payments:read',
	PAYMENTS_UPDATE: 'payments:update',
	PAYMENTS_DELETE: 'payments:delete',
	PAYMENTS_MANAGE: 'payments:manage',
	PAYMENTS_EXPORT: 'payments:export',
	PAYMENTS_APPROVE: 'payments:approve',

	// Announcements
	ANNOUNCEMENTS_CREATE: 'announcements:create',
	ANNOUNCEMENTS_READ: 'announcements:read',
	ANNOUNCEMENTS_UPDATE: 'announcements:update',
	ANNOUNCEMENTS_DELETE: 'announcements:delete',
	ANNOUNCEMENTS_MANAGE: 'announcements:manage',

	// Calendar
	CALENDAR_CREATE: 'calendar:create',
	CALENDAR_READ: 'calendar:read',
	CALENDAR_UPDATE: 'calendar:update',
	CALENDAR_DELETE: 'calendar:delete',
	CALENDAR_MANAGE: 'calendar:manage',

	// Messages
	MESSAGES_CREATE: 'messages:create',
	MESSAGES_READ: 'messages:read',
	MESSAGES_DELETE: 'messages:delete',
	MESSAGES_MANAGE: 'messages:manage',

	// IT Support
	IT_LOGS_READ: 'it:logs:read',
	IT_SYSTEM_MANAGE: 'it:system:manage',
	IT_SUPPORT_MANAGE: 'it:support:manage',
	IT_BACKUP_MANAGE: 'it:backup:manage'
} as const;

export type SystemPermissionType = (typeof SystemPermission)[keyof typeof SystemPermission];

/**
 * Permission string type that matches database format
 */
export type PermissionString = SystemPermissionType | (string & {});

/**
 * System Roles with their default permissions
 */
export const SystemRole = {
	SUPER_ADMIN: 'super_admin',
	ADMIN: 'admin',
	IT: 'IT',
	PRINCIPAL: 'principal',
	TEACHER: 'teacher',
	STUDENT: 'student',
	PARENT: 'parent',
	ACCOUNTANT: 'accountant'
} as const;

export type SystemRoleType = (typeof SystemRole)[keyof typeof SystemRole];

/**
 * Default permissions for each system role
 */
export const DefaultRolePermissions: Record<SystemRoleType, SystemPermissionType[]> = {
	[SystemRole.SUPER_ADMIN]: Object.values(SystemPermission),

	[SystemRole.ADMIN]: [
		SystemPermission.USERS_CREATE,
		SystemPermission.USERS_READ,
		SystemPermission.USERS_UPDATE,
		SystemPermission.USERS_DELETE,
		SystemPermission.USERS_MANAGE,
		SystemPermission.SCHOOLS_READ,
		SystemPermission.SCHOOLS_UPDATE,
		SystemPermission.CLASSES_CREATE,
		SystemPermission.CLASSES_READ,
		SystemPermission.CLASSES_UPDATE,
		SystemPermission.CLASSES_DELETE,
		SystemPermission.CLASSES_MANAGE,
		SystemPermission.STUDENTS_CREATE,
		SystemPermission.STUDENTS_READ,
		SystemPermission.STUDENTS_UPDATE,
		SystemPermission.STUDENTS_DELETE,
		SystemPermission.STUDENTS_MANAGE,
		SystemPermission.STUDENTS_EXPORT,
		SystemPermission.STUDENTS_IMPORT,
		SystemPermission.LEVELS_CREATE,
		SystemPermission.LEVELS_READ,
		SystemPermission.LEVELS_UPDATE,
		SystemPermission.LEVELS_DELETE,
		SystemPermission.LEVELS_ASSIGN_STUDENTS,
		SystemPermission.BRANCHES_CREATE,
		SystemPermission.BRANCHES_READ,
		SystemPermission.BRANCHES_UPDATE,
		SystemPermission.BRANCHES_DELETE,
		SystemPermission.BRANCHES_ASSIGN_STUDENTS,
		SystemPermission.TEACHERS_CREATE,
		SystemPermission.TEACHERS_READ,
		SystemPermission.TEACHERS_UPDATE,
		SystemPermission.TEACHERS_DELETE,
		SystemPermission.TEACHERS_MANAGE,
		SystemPermission.COURSES_CREATE,
		SystemPermission.COURSES_READ,
		SystemPermission.COURSES_UPDATE,
		SystemPermission.COURSES_DELETE,
		SystemPermission.COURSES_MANAGE,
		SystemPermission.GRADES_READ,
		SystemPermission.GRADES_MANAGE,
		SystemPermission.GRADES_EXPORT,
		SystemPermission.GRADES_APPROVE,
		SystemPermission.ATTENDANCE_READ,
		SystemPermission.ATTENDANCE_MANAGE,
		SystemPermission.ATTENDANCE_EXPORT,
		SystemPermission.REPORTS_VIEW,
		SystemPermission.REPORTS_CREATE,
		SystemPermission.REPORTS_READ,
		SystemPermission.REPORTS_EXPORT,
		SystemPermission.REPORTS_MANAGE,
		SystemPermission.SETTINGS_READ,
		SystemPermission.SETTINGS_UPDATE,
		SystemPermission.SETTINGS_MANAGE,
		SystemPermission.ROLES_CREATE,
		SystemPermission.ROLES_READ,
		SystemPermission.ROLES_UPDATE,
		SystemPermission.ROLES_DELETE,
		SystemPermission.ROLES_ASSIGN,
		SystemPermission.ROLES_MANAGE,
		SystemPermission.PAYMENTS_READ,
		SystemPermission.PAYMENTS_MANAGE,
		SystemPermission.PAYMENTS_EXPORT,
		SystemPermission.ANNOUNCEMENTS_CREATE,
		SystemPermission.ANNOUNCEMENTS_READ,
		SystemPermission.ANNOUNCEMENTS_UPDATE,
		SystemPermission.ANNOUNCEMENTS_DELETE,
		SystemPermission.ANNOUNCEMENTS_MANAGE,
		SystemPermission.CALENDAR_CREATE,
		SystemPermission.CALENDAR_READ,
		SystemPermission.CALENDAR_UPDATE,
		SystemPermission.CALENDAR_DELETE,
		SystemPermission.CALENDAR_MANAGE,
		SystemPermission.MESSAGES_CREATE,
		SystemPermission.MESSAGES_READ,
		SystemPermission.MESSAGES_DELETE,
		SystemPermission.MESSAGES_MANAGE
	],

	[SystemRole.IT]: [
		SystemPermission.USERS_READ,
		SystemPermission.SCHOOLS_READ,
		SystemPermission.SETTINGS_READ,
		SystemPermission.SETTINGS_UPDATE,
		SystemPermission.IT_LOGS_READ,
		SystemPermission.IT_SYSTEM_MANAGE,
		SystemPermission.IT_SUPPORT_MANAGE,
		SystemPermission.IT_BACKUP_MANAGE
	],

	[SystemRole.PRINCIPAL]: [
		SystemPermission.USERS_READ,
		SystemPermission.SCHOOLS_READ,
		SystemPermission.SCHOOLS_UPDATE,
		SystemPermission.CLASSES_CREATE,
		SystemPermission.CLASSES_READ,
		SystemPermission.CLASSES_UPDATE,
		SystemPermission.CLASSES_DELETE,
		SystemPermission.STUDENTS_READ,
		SystemPermission.STUDENTS_EXPORT,
		SystemPermission.LEVELS_READ,
		SystemPermission.LEVELS_CREATE,
		SystemPermission.LEVELS_UPDATE,
		SystemPermission.LEVELS_ASSIGN_STUDENTS,
		SystemPermission.BRANCHES_READ,
		SystemPermission.BRANCHES_CREATE,
		SystemPermission.BRANCHES_UPDATE,
		SystemPermission.BRANCHES_ASSIGN_STUDENTS,
		SystemPermission.TEACHERS_READ,
		SystemPermission.TEACHERS_UPDATE,
		SystemPermission.COURSES_CREATE,
		SystemPermission.COURSES_READ,
		SystemPermission.COURSES_UPDATE,
		SystemPermission.COURSES_DELETE,
		SystemPermission.GRADES_READ,
		SystemPermission.GRADES_EXPORT,
		SystemPermission.GRADES_APPROVE,
		SystemPermission.ATTENDANCE_READ,
		SystemPermission.ATTENDANCE_EXPORT,
		SystemPermission.REPORTS_VIEW,
		SystemPermission.REPORTS_CREATE,
		SystemPermission.REPORTS_READ,
		SystemPermission.REPORTS_EXPORT,
		SystemPermission.SETTINGS_READ,
		SystemPermission.ANNOUNCEMENTS_CREATE,
		SystemPermission.ANNOUNCEMENTS_READ,
		SystemPermission.ANNOUNCEMENTS_UPDATE,
		SystemPermission.ANNOUNCEMENTS_DELETE,
		SystemPermission.CALENDAR_CREATE,
		SystemPermission.CALENDAR_READ,
		SystemPermission.CALENDAR_UPDATE,
		SystemPermission.CALENDAR_DELETE,
		SystemPermission.MESSAGES_CREATE,
		SystemPermission.MESSAGES_READ
	],

	[SystemRole.TEACHER]: [
		SystemPermission.CLASSES_READ,
		SystemPermission.STUDENTS_READ,
		SystemPermission.LEVELS_READ,
		SystemPermission.BRANCHES_READ,
		SystemPermission.COURSES_READ,
		SystemPermission.GRADES_CREATE,
		SystemPermission.GRADES_READ,
		SystemPermission.GRADES_UPDATE,
		SystemPermission.ATTENDANCE_CREATE,
		SystemPermission.ATTENDANCE_READ,
		SystemPermission.ATTENDANCE_UPDATE,
		SystemPermission.ANNOUNCEMENTS_READ,
		SystemPermission.CALENDAR_READ,
		SystemPermission.MESSAGES_CREATE,
		SystemPermission.MESSAGES_READ
	],

	[SystemRole.STUDENT]: [
		SystemPermission.CLASSES_READ,
		SystemPermission.LEVELS_READ,
		SystemPermission.BRANCHES_READ,
		SystemPermission.COURSES_READ,
		SystemPermission.GRADES_READ,
		SystemPermission.ATTENDANCE_READ,
		SystemPermission.ANNOUNCEMENTS_READ,
		SystemPermission.CALENDAR_READ,
		SystemPermission.MESSAGES_CREATE,
		SystemPermission.MESSAGES_READ
	],

	[SystemRole.PARENT]: [
		SystemPermission.STUDENTS_READ,
		SystemPermission.LEVELS_READ,
		SystemPermission.BRANCHES_READ,
		SystemPermission.GRADES_READ,
		SystemPermission.ATTENDANCE_READ,
		SystemPermission.ANNOUNCEMENTS_READ,
		SystemPermission.CALENDAR_READ,
		SystemPermission.PAYMENTS_READ,
		SystemPermission.MESSAGES_CREATE,
		SystemPermission.MESSAGES_READ
	],

	[SystemRole.ACCOUNTANT]: [
		SystemPermission.PAYMENTS_CREATE,
		SystemPermission.PAYMENTS_READ,
		SystemPermission.PAYMENTS_UPDATE,
		SystemPermission.PAYMENTS_MANAGE,
		SystemPermission.PAYMENTS_EXPORT,
		SystemPermission.PAYMENTS_APPROVE,
		SystemPermission.REPORTS_VIEW,
		SystemPermission.REPORTS_READ,
		SystemPermission.REPORTS_EXPORT,
		SystemPermission.STUDENTS_READ
	]
};

/**
 * Feature to permission mapping
 * Maps application features/routes to required permissions
 */
export const FeaturePermissions = {
	dashboard: [],
	// Users
	'users.list': [SystemPermission.USERS_READ],
	'users.create': [SystemPermission.USERS_CREATE],
	'users.edit': [SystemPermission.USERS_UPDATE],
	'users.delete': [SystemPermission.USERS_DELETE],
	// Schools
	'schools.list': [SystemPermission.SCHOOLS_READ],
	'schools.create': [SystemPermission.SCHOOLS_CREATE],
	'schools.edit': [SystemPermission.SCHOOLS_UPDATE],
	'schools.delete': [SystemPermission.SCHOOLS_DELETE],
	// Students
	'students.list': [SystemPermission.STUDENTS_READ],
	'students.create': [SystemPermission.STUDENTS_CREATE],
	'students.edit': [SystemPermission.STUDENTS_UPDATE],
	'students.delete': [SystemPermission.STUDENTS_DELETE],
	'students.export': [SystemPermission.STUDENTS_EXPORT],
	'students.import': [SystemPermission.STUDENTS_IMPORT],
	// Levels
	'levels.list': [SystemPermission.LEVELS_READ],
	'levels.create': [SystemPermission.LEVELS_CREATE],
	'levels.edit': [SystemPermission.LEVELS_UPDATE],
	'levels.delete': [SystemPermission.LEVELS_DELETE],
	'levels.assign_students': [SystemPermission.LEVELS_ASSIGN_STUDENTS],
	// Branches
	'branches.list': [SystemPermission.BRANCHES_READ],
	'branches.create': [SystemPermission.BRANCHES_CREATE],
	'branches.edit': [SystemPermission.BRANCHES_UPDATE],
	'branches.delete': [SystemPermission.BRANCHES_DELETE],
	'branches.assign_students': [SystemPermission.BRANCHES_ASSIGN_STUDENTS],
	// Roles
	'roles.list': [SystemPermission.ROLES_READ],
	'roles.create': [SystemPermission.ROLES_CREATE],
	'roles.edit': [SystemPermission.ROLES_UPDATE],
	'roles.delete': [SystemPermission.ROLES_DELETE],
	'roles.assign': [SystemPermission.ROLES_ASSIGN],
	// Reports
	'reports.view': [SystemPermission.REPORTS_VIEW],
	'reports.list': [SystemPermission.REPORTS_READ],
	'reports.create': [SystemPermission.REPORTS_CREATE],
	'reports.export': [SystemPermission.REPORTS_EXPORT],
	// Settings
	'settings.view': [SystemPermission.SETTINGS_READ],
	'settings.edit': [SystemPermission.SETTINGS_UPDATE],
	// Classes
	'classes.list': [SystemPermission.CLASSES_READ],
	'classes.create': [SystemPermission.CLASSES_CREATE],
	'classes.edit': [SystemPermission.CLASSES_UPDATE],
	'classes.delete': [SystemPermission.CLASSES_DELETE],
	// Teachers
	'teachers.list': [SystemPermission.TEACHERS_READ],
	'teachers.create': [SystemPermission.TEACHERS_CREATE],
	'teachers.edit': [SystemPermission.TEACHERS_UPDATE],
	'teachers.delete': [SystemPermission.TEACHERS_DELETE],
	// Courses
	'courses.list': [SystemPermission.COURSES_READ],
	'courses.create': [SystemPermission.COURSES_CREATE],
	'courses.edit': [SystemPermission.COURSES_UPDATE],
	'courses.delete': [SystemPermission.COURSES_DELETE],
	// Grades
	'grades.list': [SystemPermission.GRADES_READ],
	'grades.create': [SystemPermission.GRADES_CREATE],
	'grades.edit': [SystemPermission.GRADES_UPDATE],
	'grades.delete': [SystemPermission.GRADES_DELETE],
	'grades.export': [SystemPermission.GRADES_EXPORT],
	'grades.approve': [SystemPermission.GRADES_APPROVE],
	// Attendance
	'attendance.list': [SystemPermission.ATTENDANCE_READ],
	'attendance.create': [SystemPermission.ATTENDANCE_CREATE],
	'attendance.edit': [SystemPermission.ATTENDANCE_UPDATE],
	'attendance.export': [SystemPermission.ATTENDANCE_EXPORT],
	// Payments
	'payments.list': [SystemPermission.PAYMENTS_READ],
	'payments.create': [SystemPermission.PAYMENTS_CREATE],
	'payments.edit': [SystemPermission.PAYMENTS_UPDATE],
	'payments.delete': [SystemPermission.PAYMENTS_DELETE],
	'payments.export': [SystemPermission.PAYMENTS_EXPORT],
	'payments.approve': [SystemPermission.PAYMENTS_APPROVE],
	// Announcements
	'announcements.list': [SystemPermission.ANNOUNCEMENTS_READ],
	'announcements.create': [SystemPermission.ANNOUNCEMENTS_CREATE],
	'announcements.edit': [SystemPermission.ANNOUNCEMENTS_UPDATE],
	'announcements.delete': [SystemPermission.ANNOUNCEMENTS_DELETE],
	// Calendar
	'calendar.view': [SystemPermission.CALENDAR_READ],
	'calendar.create': [SystemPermission.CALENDAR_CREATE],
	'calendar.edit': [SystemPermission.CALENDAR_UPDATE],
	'calendar.delete': [SystemPermission.CALENDAR_DELETE],
	// Messages
	'messages.list': [SystemPermission.MESSAGES_READ],
	'messages.create': [SystemPermission.MESSAGES_CREATE],
	'messages.delete': [SystemPermission.MESSAGES_DELETE],
	// IT
	'it.logs': [SystemPermission.IT_LOGS_READ],
	'it.system': [SystemPermission.IT_SYSTEM_MANAGE],
	'it.support': [SystemPermission.IT_SUPPORT_MANAGE],
	'it.backup': [SystemPermission.IT_BACKUP_MANAGE]
} as const;

export type FeatureKey = keyof typeof FeaturePermissions;

/**
 * Route to required permissions mapping
 */
export const RoutePermissions: Record<string, SystemPermissionType[]> = {
	'/dashboard': [],
	// Users
	'/users': [SystemPermission.USERS_READ],
	'/users/create': [SystemPermission.USERS_CREATE],
	// Schools
	'/schools': [SystemPermission.SCHOOLS_READ],
	'/schools/create': [SystemPermission.SCHOOLS_CREATE],
	// Students
	'/students': [SystemPermission.STUDENTS_READ],
	'/students/create': [SystemPermission.STUDENTS_CREATE],
	// Levels
	'/levels': [SystemPermission.LEVELS_READ],
	'/levels/create': [SystemPermission.LEVELS_CREATE],
	// Branches
	'/branches': [SystemPermission.BRANCHES_READ],
	'/branches/create': [SystemPermission.BRANCHES_CREATE],
	// Roles
	'/roles': [SystemPermission.ROLES_READ],
	'/roles/create': [SystemPermission.ROLES_CREATE],
	// Reports
	'/reports': [SystemPermission.REPORTS_VIEW],
	// Settings
	'/settings': [SystemPermission.SETTINGS_READ],
	// Classes
	'/classes': [SystemPermission.CLASSES_READ],
	'/classes/create': [SystemPermission.CLASSES_CREATE],
	// Teachers
	'/teachers': [SystemPermission.TEACHERS_READ],
	'/teachers/create': [SystemPermission.TEACHERS_CREATE],
	// Courses
	'/courses': [SystemPermission.COURSES_READ],
	'/courses/create': [SystemPermission.COURSES_CREATE],
	// Grades
	'/grades': [SystemPermission.GRADES_READ],
	// Attendance
	'/attendance': [SystemPermission.ATTENDANCE_READ],
	// Payments
	'/payments': [SystemPermission.PAYMENTS_READ],
	// Announcements
	'/announcements': [SystemPermission.ANNOUNCEMENTS_READ],
	// Calendar
	'/calendar': [SystemPermission.CALENDAR_READ],
	// Messages
	'/messages': [SystemPermission.MESSAGES_READ],
	// IT
	'/it': [SystemPermission.IT_LOGS_READ],
	'/it/system': [SystemPermission.IT_SYSTEM_MANAGE],
	'/it/backup': [SystemPermission.IT_BACKUP_MANAGE]
};

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(category: PermissionCategoryType): SystemPermissionType[] {
	return Object.values(SystemPermission).filter((p) => p.startsWith(`${category}:`));
}

/**
 * Parse permission string to get category and action
 */
export function parsePermission(permission: string): { category: string; action: string } | null {
	const parts = permission.split(':');
	if (parts.length < 2) return null;
	return {
		category: parts[0],
		action: parts.slice(1).join(':')
	};
}

/**
 * Check if a permission string is valid
 */
export function isValidPermission(permission: string): permission is SystemPermissionType {
	return Object.values(SystemPermission).includes(permission as SystemPermissionType);
}
