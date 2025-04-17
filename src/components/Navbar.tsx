// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			router.push("/");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	// Determine button color based on user role
	const getButtonColorClass = () => {
		if (!user) return "bg-blue-600 hover:bg-blue-700";

		switch (user.role) {
			case "student":
				return "bg-blue-600 hover:bg-blue-700";
			case "teacher":
				return "bg-green-600 hover:bg-green-700";
			case "admin":
				return "bg-purple-600 hover:bg-purple-700";
			default:
				return "bg-gray-600 hover:bg-gray-700";
		}
	};

	return (
		<nav className="bg-white shadow-md fixed w-full z-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						{user ? (
							<Link
								href={`/dashboard/${user?.role}`}
								className="flex-shrink-0 flex items-center"
							>
								<span className="ml-2 text-xl font-bold text-gray-800">
									CommunityLearn
								</span>
							</Link>
						) : (
							<Link href={`/`} className="flex-shrink-0 flex items-center">
								<span className="ml-2 text-xl font-bold text-gray-800">
									CommunityLearn
								</span>
							</Link>
						)}
					</div>

					{/* Desktop navigation */}
					<div className="hidden md:flex items-center space-x-4 text-black">
						{user && (
							<>
								<Link
									href={`/dashboard/${user?.role}`}
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Home
								</Link>
								{user.role === "student" && (
									<Link
										href={`/dashboard/${user.role}/lessons`}
										className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
									>
										Lessons
									</Link>
								)}
								{user.role === "teacher" && (
									<Link
										href={`/dashboard/${user.role}/upload`}
										className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
									>
										Upload New Lesson
									</Link>
								)}
								{user.role === "admin" && (
									<>
										<Link
											href="/dashboard/admin/users"
											className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
										>
											Users
										</Link>
										<Link
											href="/dashboard/admin/lessons"
											className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
										>
											Lessons
										</Link>
									</>
								)}
							</>
						)}

						{user ? (
							<div className="flex items-center space-x-4">
								<span className="text-sm text-gray-700">
									{user.name} ({user.role})
								</span>
								<button
									onClick={handleLogout}
									className={`${getButtonColorClass()} text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer`}
								>
									Logout
								</button>
							</div>
						) : (
							<div></div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							{/* Icon when menu is closed */}
							<svg
								className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
							{/* Icon when menu is open */}
							<svg
								className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu, show/hide based on menu state */}
			<div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
				<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
					{user && (
						<>
							<Link
								href={`/dashboard/${user?.role}`}
								className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
								onClick={() => setIsMenuOpen(false)}
							>
								Home
							</Link>

							{user.role === "student" && (
								<Link
									href={`/dashboard/${user.role}/lessons`}
									className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Lessons
								</Link>
							)}

							{user.role === "teacher" && (
								<Link
									href={`/dashboard/${user.role}/upload`}
									className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Upload New Lesson
								</Link>
							)}

							{user.role === "admin" && (
								<>
									<Link
										href={`/dashboard/${user.role}/users`}
										className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
										onClick={() => setIsMenuOpen(false)}
									>
										Users
									</Link>
									<Link
										href={`/dashboard/${user.role}/lessons`}
										className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
										onClick={() => setIsMenuOpen(false)}
									>
										Lessons
									</Link>
								</>
							)}
						</>
					)}
				</div>

				<div className="pt-4 pb-3 border-t border-gray-200">
					{user ? (
						<div className="px-2 space-y-3">
							<div className="px-3 py-2">
								<p className="text-base font-medium text-gray-800">
									{user.name}
								</p>
								<p className="text-sm font-medium text-gray-500 capitalize">
									{user.role}
								</p>
							</div>
							<button
								onClick={() => {
									handleLogout();
									setIsMenuOpen(false);
								}}
								className={`${getButtonColorClass()} cursor-pointer w-full text-white px-4 py-2 rounded-md text-base font-medium`}
							>
								Logout
							</button>
						</div>
					) : (
						<div className="px-2">
							<Link
								href="/"
								onClick={() => setIsMenuOpen(false)}
								className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium"
							>
								Get Started
							</Link>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
