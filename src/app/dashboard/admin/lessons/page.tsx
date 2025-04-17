// app/admin/lessons/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
	collection,
	getDocs,
	doc,
	deleteDoc,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";

interface Lesson {
	id: string;
	title: string;
	description: string;
	fileURL: string;
	teacherId: string;
	teacherName: string;
	timestamp: any;
	status: "approved" | "pending" | "rejected";
	subject: string;
	views: number;
	downloads: number;
}

export default function AdminLessonManagement() {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [filterSubject, setFilterSubject] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<string>("newest");

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				const lessonsCollection = collection(db, "lessons");
				const lessonSnapshot = await getDocs(lessonsCollection);
				const lessonsList = lessonSnapshot.docs.map(
					(doc) =>
						({
							id: doc.id,
							...doc.data(),
						} as Lesson)
				);
				setLessons(lessonsList);
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching lessons:", error);
				setIsLoading(false);
			}
		};

		fetchLessons();
	}, []);

	const handleDeleteLesson = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this lesson?")) {
			try {
				await deleteDoc(doc(db, "lessons", id));
				setLessons(lessons.filter((lesson) => lesson.id !== id));
			} catch (error) {
				console.error("Error deleting lesson:", error);
			}
		}
	};

	const handleUpdateStatus = async (
		id: string,
		status: "approved" | "pending" | "rejected"
	) => {
		try {
			await updateDoc(doc(db, "lessons", id), { status });
			setLessons(
				lessons.map((lesson) =>
					lesson.id === id ? { ...lesson, status } : lesson
				)
			);
		} catch (error) {
			console.error("Error updating lesson status:", error);
		}
	};

	const filteredLessons = lessons
		.filter(
			(lesson) => filterStatus === "all" || lesson.status === filterStatus
		)
		.filter(
			(lesson) => filterSubject === "all" || lesson.subject === filterSubject
		)
		.filter(
			(lesson) =>
				lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				lesson.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
		);

	const sortedLessons = [...filteredLessons].sort((a, b) => {
		switch (sortBy) {
			case "newest":
				return b.timestamp.seconds - a.timestamp.seconds;
			case "oldest":
				return a.timestamp.seconds - b.timestamp.seconds;
			case "title":
				return a.title.localeCompare(b.title);
			case "views":
				return b.views - a.views;
			default:
				return 0;
		}
	});

	return (
		<div className="min-h-screen bg-gray-50 text-black">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
				<div className="bg-white shadow rounded-lg p-6 mb-6">
					<h1 className="text-2xl font-bold text-indigo-800 mt-16 mb-5">
						Admin Lesson Management
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
						<div>
							<label
								htmlFor="searchQuery"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Search Lessons
							</label>
							<input
								type="text"
								id="searchQuery"
								placeholder="Search by title, description, or teacher"
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor="filterStatus"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Filter by Status
							</label>
							<select
								id="filterStatus"
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
							>
								<option value="all">All Statuses</option>
								<option value="approved">Approved</option>
								<option value="pending">Pending</option>
								<option value="rejected">Rejected</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="filterSubject"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Filter by Subject
							</label>
							<select
								id="filterSubject"
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={filterSubject}
								onChange={(e) => setFilterSubject(e.target.value)}
							>
								<option value="all">All Subjects</option>
								<option value="mathematics">Mathematics</option>
								<option value="science">Science</option>
								<option value="english">English</option>
								<option value="social">Social Studies</option>
								<option value="computers">Computer Science</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="sortBy"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Sort By
							</label>
							<select
								id="sortBy"
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
							>
								<option value="newest">Newest First</option>
								<option value="oldest">Oldest First</option>
								<option value="title">Title (A-Z)</option>
								<option value="views">Most Views</option>
							</select>
						</div>
					</div>

					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold text-gray-700">
							{filteredLessons.length} Lessons
						</h2>
						<div className="text-sm text-gray-500">
							Showing {filteredLessons.length} of {lessons.length} total lessons
						</div>
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center h-64">
							<div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Title & Description
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Teacher
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Subject
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Stats
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{sortedLessons.length > 0 ? (
										sortedLessons.map((lesson) => (
											<tr key={lesson.id} className="hover:bg-gray-50">
												<td className="px-6 py-4">
													<div className="flex items-center">
														<div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
															{lesson.fileURL.includes(".pdf") ? (
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-6 w-6 text-red-500"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																	/>
																</svg>
															) : (
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-6 w-6 text-blue-500"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
																	/>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																	/>
																</svg>
															)}
														</div>
														<div className="ml-4">
															<div className="text-sm font-medium text-gray-900">
																{lesson.title}
															</div>
															<div className="text-sm text-gray-500 line-clamp-2">
																{lesson.description}
															</div>
															<div className="text-xs text-gray-400 mt-1">
																{new Date(
																	lesson.timestamp.seconds * 1000
																).toLocaleDateString()}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="text-sm text-gray-900">
														{lesson.teacherName}
													</div>
												</td>
												<td className="px-6 py-4">
													<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
														{lesson.subject}
													</span>
												</td>
												<td className="px-6 py-4">
													<div className="text-sm text-gray-900">
														{lesson.views} views
													</div>
													<div className="text-sm text-gray-500">
														{lesson.downloads} downloads
													</div>
												</td>
												<td className="px-6 py-4">
													<span
														className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
															lesson.status === "approved"
																? "bg-green-100 text-green-800"
																: lesson.status === "rejected"
																? "bg-red-100 text-red-800"
																: "bg-yellow-100 text-yellow-800"
														}`}
													>
														{lesson.status.charAt(0).toUpperCase() +
															lesson.status.slice(1)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
													<div className="flex space-x-2">
														<button
															onClick={() =>
																handleUpdateStatus(lesson.id, "approved")
															}
															className={`${
																lesson.status === "approved"
																	? "bg-green-600"
																	: "bg-gray-200 hover:bg-green-500 hover:text-white"
															} text-xs px-2 py-1 rounded`}
														>
															Approve
														</button>
														<button
															onClick={() =>
																handleUpdateStatus(lesson.id, "rejected")
															}
															className={`${
																lesson.status === "rejected"
																	? "bg-red-600 text-white"
																	: "bg-gray-200 hover:bg-red-500 hover:text-white"
															} text-xs px-2 py-1 rounded`}
														>
															Reject
														</button>
														<button
															onClick={() => handleDeleteLesson(lesson.id)}
															className="bg-gray-200 hover:bg-red-600 hover:text-white text-xs px-2 py-1 rounded"
														>
															Delete
														</button>
													</div>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={6}
												className="px-6 py-4 text-center text-gray-500"
											>
												No lessons found matching your filters
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
