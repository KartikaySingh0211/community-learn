// app/auth/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { UserRole } from "@/types";

export default function AuthPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const role = searchParams.get("role") as UserRole;
	const { login, register, user } = useAuth();

	// Form states
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);

	// Form validation states
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [nameError, setNameError] = useState("");
	const [confirmPasswordError, setConfirmPasswordError] = useState("");
	const [formError, setFormError] = useState("");

	// If user is already logged in, redirect to dashboard
	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	// If role is not defined in query, redirect to homepage
	useEffect(() => {
		if (!role) {
			router.push("/");
		}
	}, [role, router]);

	// Get role-specific styling
	const getRoleStyles = () => {
		switch (role) {
			case "student":
				return {
					bgColor: "bg-blue-600",
					hoverBgColor: "hover:bg-blue-700",
					textColor: "text-blue-600",
					borderColor: "border-blue-600",
					title: "Student",
				};
			case "teacher":
				return {
					bgColor: "bg-green-600",
					hoverBgColor: "hover:bg-green-700",
					textColor: "text-green-600",
					borderColor: "border-green-600",
					title: "Teacher",
				};
			case "admin":
				return {
					bgColor: "bg-purple-600",
					hoverBgColor: "hover:bg-purple-700",
					textColor: "text-purple-600",
					borderColor: "border-purple-600",
					title: "Admin",
				};
			default:
				return {
					bgColor: "bg-gray-600",
					hoverBgColor: "hover:bg-gray-700",
					textColor: "text-gray-600",
					borderColor: "border-gray-600",
					title: "User",
				};
		}
	};

	const { bgColor, hoverBgColor, textColor, borderColor, title } =
		getRoleStyles();

	// Validate form
	const validateForm = () => {
		let isValid = true;

		// Reset errors
		setEmailError("");
		setPasswordError("");
		setNameError("");
		setConfirmPasswordError("");
		setFormError("");

		// Email validation
		if (!email) {
			setEmailError("Email is required");
			isValid = false;
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			setEmailError("Email is invalid");
			isValid = false;
		}

		// Password validation
		if (!password) {
			setPasswordError("Password is required");
			isValid = false;
		} else if (password.length < 6) {
			setPasswordError("Password must be at least 6 characters");
			isValid = false;
		}

		// Additional validations for signup
		if (isSignUp) {
			if (!name) {
				setNameError("Name is required");
				isValid = false;
			}

			if (!confirmPassword) {
				setConfirmPasswordError("Please confirm your password");
				isValid = false;
			} else if (password !== confirmPassword) {
				setConfirmPasswordError("Passwords do not match");
				isValid = false;
			}
		}

		return isValid;
	};

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		try {
			await login(email, password);
			router.push("/dashboard");
		} catch (error: any) {
			setFormError(error.message || "Sign in failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		try {
			await register(email, password, name, role);
			router.push("/dashboard");
		} catch (error: any) {
			setFormError(error.message || "Sign up failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-black mt-16">
						CommunityLearn
					</h1>
					<div className="mt-2 flex items-center justify-center space-x-2">
						<span className="text-lg text-black">Accessing as</span>
						<span
							className={`px-2 py-1 rounded-md ${bgColor} text-white text-sm font-medium`}
						>
							{title}
						</span>
					</div>
				</div>

				<div className="bg-white shadow-md rounded-lg p-8">
					<div className="flex border-b mb-6">
						<button
							className={`flex-1 py-2 ${
								!isSignUp
									? `font-medium ${textColor} border-b-2 ${borderColor}`
									: "text-gray-500"
							}`}
							onClick={() => setIsSignUp(false)}
						>
							Sign In
						</button>
						<button
							className={`flex-1 py-2 ${
								isSignUp
									? `font-medium ${textColor} border-b-2 ${borderColor}`
									: "text-gray-500"
							}`}
							onClick={() => setIsSignUp(true)}
						>
							Sign Up
						</button>
					</div>

					{formError && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
							{formError}
						</div>
					)}

					<form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
						<div className="space-y-4">
							{isSignUp && (
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Full Name
									</label>
									<input
										id="name"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black ${
											nameError ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Enter your full name"
									/>
									{nameError && (
										<p className="mt-1 text-sm text-red-600">{nameError}</p>
									)}
								</div>
							)}

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
										emailError ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="your.email@example.com"
								/>
								{emailError && (
									<p className="mt-1 text-sm text-red-600">{emailError}</p>
								)}
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Password
								</label>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
										passwordError ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={
										isSignUp ? "Create a password" : "Enter your password"
									}
								/>
								{passwordError && (
									<p className="mt-1 text-sm text-red-600">{passwordError}</p>
								)}
							</div>

							{isSignUp && (
								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Confirm Password
									</label>
									<input
										id="confirmPassword"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
											confirmPasswordError
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="Confirm your password"
									/>
									{confirmPasswordError && (
										<p className="mt-1 text-sm text-red-600">
											{confirmPasswordError}
										</p>
									)}
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className={`w-full py-2 px-4 rounded-md text-white font-medium ${bgColor} ${hoverBgColor} transition-colors ${
									loading ? "opacity-70 cursor-not-allowed" : ""
								}`}
							>
								{loading
									? "Processing..."
									: isSignUp
									? "Create Account"
									: "Sign In"}
							</button>
						</div>
					</form>
				</div>

				<div className="mt-4 text-center">
					<Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
						Return to Home
					</Link>
				</div>
			</div>
		</main>
	);
}
