// contexts/auth-context.tsx
"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { User, UserRole } from "@/types";

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	error: null,
	login: async () => {},
	register: async () => {},
	logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Get user data from Firestore
	const getUserData = async (uid: string) => {
		const userDoc = await getDoc(doc(db, "users", uid));
		if (userDoc.exists()) {
			return userDoc.data() as User;
		}
		return null;
	};

	// Register new user
	const register = async (
		email: string,
		password: string,
		name: string,
		role: UserRole
	) => {
		try {
			setError(null);
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const { uid } = userCredential.user;

			// Create user document in Firestore
			const userData: User = {
				id: uid,
				email,
				name,
				role,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await setDoc(doc(db, "users", uid), userData);
			setUser(userData);
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	// Login user
	const login = async (email: string, password: string) => {
		try {
			setError(null);
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	// Logout user
	const logout = async () => {
		try {
			setError(null);
			await signOut(auth);
			setUser(null);
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	// Listen to auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			async (firebaseUser: FirebaseUser | null) => {
				setLoading(true);
				try {
					if (firebaseUser) {
						const userData = await getUserData(firebaseUser.uid);
						if (userData) {
							setUser(userData);
						} else {
							setUser(null);
						}
					} else {
						setUser(null);
					}
				} catch (err: any) {
					setError(err.message);
				} finally {
					setLoading(false);
				}
			}
		);

		return () => unsubscribe();
	}, []);

	const value = {
		user,
		loading,
		error,
		login,
		register,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
