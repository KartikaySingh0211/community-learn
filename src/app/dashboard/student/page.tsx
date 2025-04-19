"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboard() {
	const { user: authUser } = useAuth();
	const [user, setUser] = useState<User | null>(() => authUser);
	const [loading, setLoading] = useState(true);

	interface Lesson {
		id: string;
		title: string;
		[key: string]: any;
	}
	const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
	const router = useRouter();
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
				await fetchRecentLessons();
			} else {
				router.push("/");
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const fetchRecentLessons = async () => {
		try {
			const lessonsQuery = query(
				collection(db, "lessons"),
				orderBy("timestamp", "desc")
			);
			const querySnapshot = await getDocs(lessonsQuery);

			interface Lesson {
				id: string;
				title: string;
				[key: string]: any;
			}
			const lessons: Lesson[] = [];

			querySnapshot.forEach((doc) => {
				lessons.push({
					id: doc.id,
					title: doc.data().title || "Untitled",
					...doc.data(),
				});
			});

			setRecentLessons(lessons.slice(0, 5)); // Get 5 most recent lessons
		} catch (error) {
			console.error("Error fetching recent lessons:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="p-8 bg-gradient-to-br from-indigo-50 to-white h-screen text-black">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold text-white">
					Welcome, {user?.name || "Student"}
				</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				<div className="bg-blue-50 p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Quick Access</h2>
					<div className="space-y-2">
						<Link
							href="/dashboard/student/lessons"
							className="block bg-white p-4 rounded shadow hover:shadow-md"
						>
							<span className="font-medium">Browse All Lessons</span>
						</Link>
						{/* <Link
							href="/dashboard/student/bookmarks"
							className="block bg-white p-4 rounded shadow hover:shadow-md"
						>
							<span className="font-medium">My Bookmarks</span>
						</Link> */}
					</div>
				</div>

				<div className="bg-green-50 p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Recent Lessons</h2>
					{recentLessons.length > 0 ? (
						<ul className="space-y-2">
							{recentLessons.map((lesson) => (
								<li
									key={lesson.id}
									className="bg-white p-3 rounded shadow hover:shadow-md"
								>
									<Link href={`/student/lessons/${lesson.id}`}>
										<span className="font-medium">{lesson.title}</span>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p>No recent lessons available</p>
					)}
				</div>
			</div>

			<div className="bg-gray-50 p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Announcements</h2>
				<p>Stay tuned for upcoming exams and important notices!</p>
			</div>
		</div>
	);
}
