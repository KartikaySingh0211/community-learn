// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { User } from "../types";
import { setCookie, destroyCookie } from "nookies";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	// const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					// Get additional user data from Firestore
					const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

					if (userDoc.exists()) {
						const userData = userDoc.data();
						const fullUser: User = {
							id: firebaseUser.uid,
							name: userData.name || "",
							email: firebaseUser.email || "",
							role: userData.role,
						};

						setUser(fullUser);

						// Set cookies for middleware
						const token = await firebaseUser.getIdToken();
						setCookie(null, "session", token, {
							maxAge: 30 * 24 * 60 * 60,
							path: "/",
						});

						setCookie(null, "user_role", userData.role, {
							maxAge: 30 * 24 * 60 * 60,
							path: "/",
						});
					} else {
						console.warn("User exists in Auth but not in Firestore");
						setUser(null);
						destroyCookie(null, "session");
						destroyCookie(null, "user_role");
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
					setUser(null);
					destroyCookie(null, "session");
					destroyCookie(null, "user_role");
				}
			} else {
				setUser(null);
				destroyCookie(null, "session");
				destroyCookie(null, "user_role");
			}

			// setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const signOut = async () => {
		try {
			await auth.signOut();
			destroyCookie(null, "session");
			destroyCookie(null, "user_role");
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return { user, signOut };
}
