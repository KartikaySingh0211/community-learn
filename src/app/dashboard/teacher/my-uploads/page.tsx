"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	collection,
	query,
	where,
	getDocs,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { useAuth } from "@/hooks/useAuth";

interface Lesson {
	id: string;
	title: string;
	subject: string;
	grade: string;
	language: string;
	fileType: string;
	fileName: string;
	timestamp: { seconds: number };
	views: number;
	downloads: number;
	fileURL: string;
}

export default function MyUploads() {
	const { user } = useAuth();
	const router = useRouter();
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSubject, setFilterSubject] = useState("");

	useEffect(() => {
		const fetchLessons = async () => {
			if (!user) return;

			try {
				const lessonRef = collection(db, "lessons");
				const q = query(lessonRef, where("teacherId", "==", user.id));
				const querySnapshot = await getDocs(q);

				const lessonData: Lesson[] = [];
				querySnapshot.forEach((doc) => {
					lessonData.push({ id: doc.id, ...doc.data() } as Lesson);
				});

				// Sort by timestamp descending (newest first)
				lessonData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
				setLessons(lessonData);
			} catch (error: any) {
				setError("Error fetching lessons: " + error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLessons();
	}, [user]);

	const handleDeleteLesson = async (lessonId: string, fileURL: string) => {
		if (!user) return;

		setIsDeleting(true);
		try {
			// Delete from Firestore
			await deleteDoc(doc(db, "lessons", lessonId));

			// Delete from Storage if URL exists
			if (fileURL) {
				const fileRef = ref(storage, fileURL);
				await deleteObject(fileRef);
			}

			// Update state
			setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
			setSelectedLesson(null);
		} catch (error: any) {
			setError("Error deleting lesson: " + error.message);
		} finally {
			setIsDeleting(false);
		}
	};

	const filteredLessons = lessons.filter((lesson) => {
		const matchesSearch =
			lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lesson.subject.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesSubject = filterSubject
			? lesson.subject === filterSubject
			: true;

		return matchesSearch && matchesSubject;
	});

	const subjects = Array.from(new Set(lessons.map((lesson) => lesson.subject)));

	if (isLoading) return <div className="p-8">Loading your lessons...</div>;

	return (
		<main className="pt-24 px-4 min-h-screen bg-gradient-to-br from-indigo-50 to-white flex justify-center items-start">
			<div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg text-black">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">My Uploaded Lessons</h1>
					<button
						onClick={() => router.push("/dashboard/teacher/upload")}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
					>
						Upload New Lesson
					</button>
				</div>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}

				{/* Filters */}
				<div className="bg-white rounded-lg shadow p-4 mb-6">
					<div className="flex flex-col md:flex-row md:items-center gap-4">
						<div className="flex-1">
							<input
								type="text"
								placeholder="Search lessons..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-3 py-2 border rounded"
							/>
						</div>

						<div className="md:w-48">
							<select
								value={filterSubject}
								onChange={(e) => setFilterSubject(e.target.value)}
								className="w-full px-3 py-2 border rounded"
							>
								<option value="">All Subjects</option>
								{subjects.map((subject) => (
									<option key={subject} value={subject}>
										{subject}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Lessons Table */}
				{filteredLessons.length > 0 ? (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Title
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Subject
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Grade
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Uploaded On
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Views
										</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredLessons.map((lesson) => (
										<tr key={lesson.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">
													{lesson.title}
												</div>
												<div className="text-sm text-gray-500">
													{lesson.fileName}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{lesson.subject}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												Class {lesson.grade}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												<span
													className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
													lesson.fileType === "document"
														? "bg-blue-100 text-blue-800"
														: lesson.fileType === "video"
														? "bg-purple-100 text-purple-800"
														: "bg-green-100 text-green-800"
												}`}
												>
													{lesson.fileType.charAt(0).toUpperCase() +
														lesson.fileType.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(
													lesson.timestamp.seconds * 1000
												).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{lesson.views || 0}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-center">
												<div className="flex justify-center space-x-2">
													<a
														href={lesson.fileURL}
														target="_blank"
														rel="noopener noreferrer"
														className="text-indigo-600 hover:text-indigo-900"
													>
														View
													</a>
													<button
														onClick={() => setSelectedLesson(lesson.id)}
														className="text-red-600 hover:text-red-900"
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500">
							{searchTerm || filterSubject
								? "No lessons match your search criteria."
								: "You haven't uploaded any lessons yet."}
						</p>
						{!searchTerm && !filterSubject && (
							<button
								onClick={() => router.push("/dashboard/teacher/upload-lesson")}
								className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
							>
								Upload Your First Lesson
							</button>
						)}
					</div>
				)}

				{/* Delete Confirmation Modal */}
				{selectedLesson && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 max-w-md w-full">
							<h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
							<p className="text-gray-600 mb-6">
								Are you sure you want to delete this lesson? This action cannot
								be undone.
							</p>
							<div className="flex justify-end space-x-4">
								<button
									onClick={() => setSelectedLesson(null)}
									className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
									disabled={isDeleting}
								>
									Cancel
								</button>
								<button
									onClick={() => {
										const lesson = lessons.find((l) => l.id === selectedLesson);
										if (lesson) {
											handleDeleteLesson(lesson.id, lesson.fileURL);
										}
									}}
									className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
									disabled={isDeleting}
								>
									{isDeleting ? "Deleting..." : "Delete"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
