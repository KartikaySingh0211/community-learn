// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				// If not logged in, redirect to home
				router.push("/");
			} else {
				// Redirect based on role
				switch (user.role) {
					case "student":
						router.push("/dashboard/student");
						break;
					case "teacher":
						router.push("/dashboard/teacher");
						break;
					case "admin":
						router.push("/dashboard/admin");
						break;
					default:
						router.push("/");
				}
			}
		}
	}, [user, loading, router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
				<p className="mt-4 text-lg">Redirecting to your dashboard...</p>
			</div>
		</div>
	);
}
