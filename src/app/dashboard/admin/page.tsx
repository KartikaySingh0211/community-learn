// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
export default function AdminDashboard() {
	const [stats, setStats] = useState({
		totalUsers: 0,
		students: 0,
		teachers: 0,
		totalLessons: 0,
		flaggedContent: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchStats() {
			try {
				// Fetch users
				const usersRef = collection(db, "users");
				const usersSnapshot = await getDocs(usersRef);
				const totalUsers = usersSnapshot.size;

				// Count by role
				let students = 0;
				let teachers = 0;
				usersSnapshot.forEach((doc) => {
					const userData = doc.data();
					if (userData.role === "student") students++;
					if (userData.role === "teacher") teachers++;
				});

				// Fetch lessons
				const lessonsRef = collection(db, "lessons");
				const lessonsSnapshot = await getDocs(lessonsRef);
				const totalLessons = lessonsSnapshot.size;

				// Fetch flagged content
				const flaggedQuery = query(
					collection(db, "lessons"),
					where("status", "==", "flagged")
				);
				const flaggedSnapshot = await getDocs(flaggedQuery);
				const flaggedContent = flaggedSnapshot.size;

				setStats({
					totalUsers,
					students,
					teachers,
					totalLessons,
					flaggedContent,
				});
			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchStats();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-gray-900 mb-6">
					Dashboard Overview
				</h1>

				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<p className="text-gray-500">Loading dashboard data...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{/* Total Users Card */}
						<div className="bg-white overflow-hidden shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
										<svg
											className="h-6 w-6 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
											/>
										</svg>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dt className="text-sm font-medium text-gray-500 truncate">
											Total Users
										</dt>
										<dd className="flex items-baseline">
											<div className="text-2xl font-semibold text-gray-900">
												{stats.totalUsers}
											</div>
										</dd>
									</div>
								</div>
								<div className="mt-4 flex justify-between text-sm text-gray-500">
									<div>Students: {stats.students}</div>
									<div>Teachers: {stats.teachers}</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-4 sm:px-6">
								<Link
									href="/dashboard/admin/users"
									className="text-sm font-medium text-blue-600 hover:text-blue-500"
								>
									View all users
								</Link>
							</div>
						</div>

						{/* Total Lessons Card */}
						<div className="bg-white overflow-hidden shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0 bg-green-500 rounded-md p-3">
										<svg
											className="h-6 w-6 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
											/>
										</svg>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dt className="text-sm font-medium text-gray-500 truncate">
											Total Lessons
										</dt>
										<dd className="flex items-baseline">
											<div className="text-2xl font-semibold text-gray-900">
												{stats.totalLessons}
											</div>
										</dd>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-4 sm:px-6">
								<Link
									href="/dashboard/admin/lessons"
									className="text-sm font-medium text-blue-600 hover:text-blue-500"
								>
									View all lessons
								</Link>
							</div>
						</div>

						{/* Flagged Content Card */}
						<div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0 bg-red-500 rounded-md p-3">
										<svg
											className="h-6 w-6 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											/>
										</svg>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dt className="text-sm font-medium text-gray-500 truncate">
											Flagged Content
										</dt>
										<dd className="flex items-baseline">
											<div className="text-2xl font-semibold text-gray-900">
												{stats.flaggedContent}
											</div>
										</dd>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-4 sm:px-6">
								<Link
									href="dashboard/admin/lessons?filter=flagged"
									className="text-sm font-medium text-red-600 hover:text-red-500"
								>
									Review flagged content
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* Recent Activity Section */}
				<div className="bg-white shadow rounded-lg">
					<div className="px-4 py-5 border-b border-gray-200 sm:px-6">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Recent Activity
						</h3>
					</div>
					<div className="px-4 py-5 sm:p-6">
						<p className="text-gray-500 text-center py-4">
							Connect to real-time activity feed here
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
