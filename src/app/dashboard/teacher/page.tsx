"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/hooks/useAuth";

export default function TeacherDashboard() {
	const { user } = useAuth();
	const router = useRouter();
	const [lessonCount, setLessonCount] = useState(0);
	const [recentLessons, setRecentLessons] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			if (!user) return;

			try {
				const lessonRef = collection(db, "lessons");
				const q = query(lessonRef, where("teacherId", "==", user.uid));
				const querySnapshot = await getDocs(q);

				setLessonCount(querySnapshot.size);

				const recentDocs: any[] = [];
				querySnapshot.forEach((doc) => {
					recentDocs.push({ id: doc.id, ...doc.data() });
				});

				// Sort by timestamp descending and take most recent 5
				recentDocs.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
				setRecentLessons(recentDocs.slice(0, 5));
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, [user]);

	if (isLoading) return <div className="p-8">Loading dashboard...</div>;

	return (
		<div className="p-8 bg-gradient-to-br from-indigo-50 to-white h-screen">
			<h1 className="text-2xl font-bold mb-6 mt-20 text-black">
				Teacher Dashboard
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-medium text-gray-700">Total Uploads</h2>
					<p className="text-3xl font-bold mt-2 text-blue-600">{lessonCount}</p>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-medium text-gray-700">Student Views</h2>
					<p className="text-3xl font-bold mt-2 text-blue-600">247</p>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-medium text-gray-700">Average Rating</h2>
					<p className="text-3xl font-bold mt-2 text-blue-600">4.7/5</p>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-medium">Recent Uploads</h2>
					<button
						onClick={() => router.push("/dashboard/teacher/my-uploads")}
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
					>
						View All
					</button>
				</div>

				{recentLessons.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left py-3 px-4">Title</th>
									<th className="text-left py-3 px-4">Upload Date</th>
									<th className="text-left py-3 px-4">Views</th>
								</tr>
							</thead>
							<tbody>
								{recentLessons.map((lesson) => (
									<tr key={lesson.id} className="border-b hover:bg-gray-50">
										<td className="py-3 px-4">{lesson.title}</td>
										<td className="py-3 px-4">
											{new Date(
												lesson.timestamp.seconds * 1000
											).toLocaleDateString()}
										</td>
										<td className="py-3 px-4">{lesson.views || 0}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-gray-500">No lessons uploaded yet.</p>
				)}
			</div>

			<div className="mt-8 flex gap-4">
				<button
					onClick={() => router.push("/dashboard/teacher/upload")}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
				>
					Upload New Lesson
				</button>
			</div>
		</div>
	);
}
