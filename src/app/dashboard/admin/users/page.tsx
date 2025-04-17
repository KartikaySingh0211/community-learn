// app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
	collection,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	query,
	orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";

interface User {
	id: string;
	name: string;
	email: string;
	role: "student" | "teacher" | "admin";
	createdAt: string;
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");

	useEffect(() => {
		async function fetchUsers() {
			try {
				const usersRef = collection(db, "users");
				const q = query(usersRef, orderBy("createdAt", "desc"));
				const snapshot = await getDocs(q);

				const usersData: User[] = [];
				snapshot.forEach((doc) => {
					const data = doc.data() as Omit<User, "id">;
					usersData.push({
						id: doc.id,
						...data,
						createdAt: data.createdAt || "",
					});
				});

				setUsers(usersData);
			} catch (error) {
				console.error("Error fetching users:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchUsers();
	}, []);

	const handleRoleChange = async (
		userId: string,
		newRole: "student" | "teacher" | "admin"
	) => {
		try {
			const userRef = doc(db, "users", userId);
			await updateDoc(userRef, { role: newRole });

			// Update local state
			setUsers(
				users.map((user) =>
					user.id === userId ? { ...user, role: newRole } : user
				)
			);
		} catch (error) {
			console.error("Error updating user role:", error);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (
			window.confirm(
				"Are you sure you want to delete this user? This action cannot be undone."
			)
		) {
			try {
				await deleteDoc(doc(db, "users", userId));
				setUsers(users.filter((user) => user.id !== userId));
			} catch (error) {
				console.error("Error deleting user:", error);
			}
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === "all" || user.role === roleFilter;

		return matchesSearch && matchesRole;
	});

	return (
		<div className="min-h-screen bg-gray-50 text-black">
			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-gray-900 mb-6 mt-20">
					User Management
				</h1>

				{/* Filters */}
				<div className="bg-white p-4 rounded-lg shadow mb-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div className="w-full md:w-1/3 mb-4 md:mb-0">
							<label htmlFor="search" className="sr-only">
								Search
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg
										className="h-5 w-5 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<input
									id="search"
									name="search"
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="Search users"
									type="search"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>

						<div className="w-full md:w-1/4">
							<label htmlFor="role-filter" className="sr-only">
								Filter by role
							</label>
							<select
								id="role-filter"
								name="role-filter"
								className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
							>
								<option value="all">All Roles</option>
								<option value="student">Students</option>
								<option value="teacher">Teachers</option>
								<option value="admin">Admins</option>
							</select>
						</div>
					</div>
				</div>

				{/* Users Table */}
				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<p className="text-gray-500">Loading users...</p>
					</div>
				) : (
					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Name
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Email
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Role
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Created At
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredUsers.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												className="px-6 py-4 text-center text-sm text-gray-500"
											>
												No users found matching the current filters.
											</td>
										</tr>
									) : (
										filteredUsers.map((user) => (
											<tr key={user.id}>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{user.name}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{user.email}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<select
														value={user.role}
														onChange={(e) =>
															handleRoleChange(
																user.id,
																e.target.value as
																	| "student"
																	| "teacher"
																	| "admin"
															)
														}
														className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
													>
														<option value="student">Student</option>
														<option value="teacher">Teacher</option>
														<option value="admin">Admin</option>
													</select>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{new Date(user.createdAt).toLocaleDateString()}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<button
														onClick={() => handleDeleteUser(user.id)}
														className="text-red-600 hover:text-red-900"
													>
														Delete
													</button>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
