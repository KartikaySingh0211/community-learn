"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
	doc,
	getDoc,
	updateDoc,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { User } from "firebase/auth";

export default function LessonDetail() {
	const [user, setUser] = useState<User | null>(null);
	const [lesson, setLesson] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const router = useRouter();
	const { id } = router.query;
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
			} else {
				router.push("/login");
			}
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (id && user) {
			fetchLesson();
			checkIfBookmarked();
		}
	}, [id, user]);

	const fetchLesson = async () => {
		try {
			const lessonDoc = await getDoc(doc(db, "lessons", id));

			if (lessonDoc.exists()) {
				setLesson({ id: lessonDoc.id, ...lessonDoc.data() });
			} else {
				router.push("/student/lessons");
			}

			setLoading(false);
		} catch (error) {
			console.error("Error fetching lesson:", error);
			setLoading(false);
		}
	};

	const checkIfBookmarked = async () => {
		try {
			const userDoc = await getDoc(doc(db, "users", user.uid));

			if (userDoc.exists() && userDoc.data().bookmarks) {
				setIsBookmarked(userDoc.data().bookmarks.includes(id));
			}
		} catch (error) {
			console.error("Error checking bookmark status:", error);
		}
	};

	const toggleBookmark = async () => {
		try {
			const userRef = doc(db, "users", user.uid);

			if (isBookmarked) {
				await updateDoc(userRef, {
					bookmarks: arrayRemove(id),
				});
			} else {
				await updateDoc(userRef, {
					bookmarks: arrayUnion(id),
				});
			}

			setIsBookmarked(!isBookmarked);
		} catch (error) {
			console.error("Error toggling bookmark:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				Loading...
			</div>
		);
	}

	if (!lesson) {
		return <div className="text-center p-8">Lesson not found</div>;
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-6">
				<Link href="/student/lessons" className="text-blue-500 hover:underline">
					← Back to Lessons
				</Link>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<div className="flex justify-between items-start mb-6">
					<h1 className="text-2xl font-bold">{lesson.title}</h1>
					<button
						onClick={toggleBookmark}
						className={`px-3 py-1 rounded text-sm ${
							isBookmarked ? "bg-yellow-100 text-yellow-800" : "bg-gray-100"
						}`}
					>
						{isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
					</button>
				</div>

				<div className="mb-6">
					<div className="text-sm text-gray-500 mb-2">
						<span>Subject: {lesson.subject || "N/A"}</span>
						<span className="mx-2">•</span>
						<span>
							Uploaded:{" "}
							{new Date(lesson.timestamp?.toDate()).toLocaleDateString()}
						</span>
					</div>
					<p className="text-gray-700">{lesson.description}</p>
				</div>

				{lesson.fileURL && (
					<div className="mb-6">
						<h2 className="text-lg font-semibold mb-3">Learning Materials</h2>

						{lesson.fileType === "pdf" ? (
							<div className="aspect-w-16 aspect-h-9 mb-4">
								<iframe
									src={`${lesson.fileURL}#toolbar=0`}
									className="w-full h-96 border rounded"
									title={lesson.title}
								></iframe>
							</div>
						) : lesson.fileType === "video" ? (
							<div className="aspect-w-16 aspect-h-9 mb-4">
								<video
									src={lesson.fileURL}
									controls
									className="w-full rounded"
									poster={lesson.thumbnailURL}
								>
									Your browser does not support video playback.
								</video>
							</div>
						) : (
							<a
								href={lesson.fileURL}
								target="_blank"
								rel="noopener noreferrer"
								className="block bg-blue-50 p-4 rounded text-blue-500 hover:text-blue-700"
							>
								Download Material
							</a>
						)}
					</div>
				)}

				{lesson.quiz && lesson.quiz.length > 0 && (
					<div className="mt-8 border-t pt-6">
						<h2 className="text-lg font-semibold mb-4">Practice Questions</h2>
						<div className="space-y-4">
							{lesson.quiz.map((question, index) => (
								<div key={index} className="bg-gray-50 p-4 rounded">
									<p className="font-medium mb-2">
										{index + 1}. {question.question}
									</p>
									{/* We're not showing answers directly to students */}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
