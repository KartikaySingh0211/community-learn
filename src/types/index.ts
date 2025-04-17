// User roles
export type UserRole = "student" | "teacher" | "admin";

// User interface
export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

// Lesson interface
export interface Lesson {
	id: string;
	title: string;
	description: string;
	fileURL: string;
	fileType: "pdf" | "video" | "image" | "document"; // file type
	teacherId: string;
	teacherName: string;
	subject?: string;
	grade?: string;
	language?: string;
	createdAt: Date;
	updatedAt: Date;
	viewCount: number;
	downloadCount: number;
}

// Auth context type
export interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		name: string,
		role: UserRole
	) => Promise<void>;
	logout: () => Promise<void>;
}

// Pagination state
export interface PaginationState {
	limit: number;
	lastDoc: any | null;
	hasMore: boolean;
}
