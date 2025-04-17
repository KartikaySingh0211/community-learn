"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { User } from "firebase/auth";

export default function Lessons() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	interface Lesson {
		id: string;
		title: string;
		[key: string]: any;
	}

	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSubject, setSelectedSubject] = useState("");
	const router = useRouter();
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
				await fetchLessons();
			} else {
				router.push("/login");
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, [selectedSubject]);

	const fetchLessons = async () => {
		try {
			let lessonsQuery;

			if (selectedSubject) {
				lessonsQuery = query(
					collection(db, "lessons"),
					where("subject", "==", selectedSubject),
					orderBy("timestamp", "desc")
				);
			} else {
				lessonsQuery = query(
					collection(db, "lessons"),
					orderBy("timestamp", "desc")
				);
			}

			const querySnapshot = await getDocs(lessonsQuery);

			interface Lesson {
				id: string;
				title: string;
				[key: string]: any;
			}

			const fetchedLessons: Lesson[] = [];
			querySnapshot.forEach((doc) => {
				fetchedLessons.push({
					id: doc.id,
					title: doc.data().title || "Untitled",
					...doc.data(),
				});
			});

			setLessons(fetchedLessons);
		} catch (error) {
			console.error("Error fetching lessons:", error);
		}
	};

	const filteredLessons = lessons.filter(
		(lesson) =>
			lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const subjects = [
		"Mathematics",
		"Science",
		"Hindi",
		"English",
		"Social Studies",
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Browse Lessons</h1>
				<Link
					href="/dashboard/student"
					className="text-blue-500 hover:underline"
				>
					Back to Dashboard
				</Link>
			</div>

			<div className="bg-white p-4 rounded-lg shadow mb-6 text-black">
				<div className="flex flex-col md:flex-row gap-4 mb-4">
					<input
						type="text"
						placeholder="Search lessons..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="border p-2 rounded flex-grow"
					/>

					<select
						value={selectedSubject}
						onChange={(e) => setSelectedSubject(e.target.value)}
						className="border p-2 rounded md:w-1/3"
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

			{filteredLessons.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
					{filteredLessons.map((lesson) => (
						<div
							key={lesson.id}
							className="bg-white p-4 rounded-lg shadow hover:shadow-md"
						>
							<Link href={`/student/lessons/${lesson.id}`}>
								<h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
								<p className="text-gray-600 mb-2">
									{lesson.description.substring(0, 100)}...
								</p>
								<div className="flex justify-between text-sm text-gray-500">
									<span>Subject: {lesson.subject || "N/A"}</span>
									<span>
										{new Date(lesson.timestamp?.toDate()).toLocaleDateString()}
									</span>
								</div>
							</Link>
						</div>
					))}
				</div>
			) : (
				<div className="bg-white p-6 rounded-lg shadow text-center text-black">
					<p className="text-lg">No lessons found that match your criteria.</p>
				</div>
			)}
		</div>
	);
}
