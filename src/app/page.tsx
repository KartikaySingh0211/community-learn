// app/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();

	const handleRoleSelection = (role: "student" | "teacher" | "admin") => {
		router.push(`/auth?role=${role}`);
	};

	return (
		<main className="pt-24 px-4 min-h-screen bg-gradient-to-br from-indigo-50 to-white flex justify-center items-start">
			<div className="w-full h-full bg-white p-6 rounded-xl shadow-lg text-black">
				<div className="flex flex-col items-center">
					<h1 className="mt-4 text-4xl font-bold text-center">
						CommunityLearn
					</h1>
					<p className="mt-2 text-xl text-gray-600 text-center">
						A community-powered learning platform for rural education
					</p>
				</div>

				<div className="space-y-6">
					<h2 className="text-2xl font-semibold text-center">I am a...</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all">
							<h3 className="text-xl font-medium mb-3">Student</h3>
							<p className="mb-4 text-gray-600">
								Access learning materials shared by teachers in your community.
							</p>
							<button
								onClick={() => handleRoleSelection("student")}
								className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
							>
								Continue as Student
							</button>
						</div>

						<div className="border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all">
							<h3 className="text-xl font-medium mb-3">Teacher</h3>
							<p className="mb-4 text-gray-600">
								Share your educational materials with students in the community.
							</p>
							<button
								onClick={() => handleRoleSelection("teacher")}
								className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
							>
								Continue as Teacher
							</button>
						</div>

						<div className="border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all">
							<h3 className="text-xl font-medium mb-3">Admin</h3>
							<p className="mb-4 text-gray-600">
								Manage content and users on the CommunityLearn platform.
							</p>
							<button
								onClick={() => handleRoleSelection("admin")}
								className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
							>
								Continue as Admin
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
