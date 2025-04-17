"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { useAuth } from "@/hooks/useAuth";

export default function UploadLessonPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [subject, setSubject] = useState("");
	const [grade, setGrade] = useState("");
	const [language, setLanguage] = useState("English");
	const [file, setFile] = useState<File | null>(null);
	const [fileType, setFileType] = useState<string>("document");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState("");

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);

			// Auto-detect file type
			if (selectedFile.type.includes("video")) {
				setFileType("video");
			} else if (selectedFile.type.includes("image")) {
				setFileType("image");
			} else {
				setFileType("document");
			}
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!user) {
			setError("You must be logged in to upload lessons");
			return;
		}

		if (!file) {
			setError("Please select a file to upload");
			return;
		}

		try {
			setIsUploading(true);
			setError("");

			// Create a storage reference
			const storageRef = ref(
				storage,
				`lessons/${user.id}/${Date.now()}-${file.name}`
			);

			// Upload file with progress tracking
			const uploadTask = uploadBytesResumable(storageRef, file);

			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress = Math.round(
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100
					);
					setUploadProgress(progress);
				},
				(error) => {
					setError("Upload failed: " + error.message);
					setIsUploading(false);
				},
				async () => {
					// Get download URL after successful upload
					const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

					// Save lesson info to Firestore
					await addDoc(collection(db, "lessons"), {
						title,
						description,
						subject,
						grade,
						language,
						fileURL: downloadURL,
						fileType,
						fileName: file.name,
						fileSize: file.size,
						teacherId: user.id,
						teacherName: user.name || "Unknown Teacher",
						timestamp: serverTimestamp(),
						views: 0,
						downloads: 0,
					});

					setIsUploading(false);
					router.push("/dashboard/teacher/my-uploads");
				}
			);
		} catch (err: any) {
			setError("Error: " + err.message);
			setIsUploading(false);
		}
	};

	return (
		<>
			<main className="pt-24 px-4 min-h-screen bg-gradient-to-br from-indigo-50 to-white flex justify-center items-start">
				<div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg text-black">
					<h1 className="text-2xl font-bold mb-6">Upload New Lesson</h1>

					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="bg-white rounded-lg shadow p-6"
					>
						<div className="mb-4">
							<label className="block text-gray-700 mb-2">Lesson Title *</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-3 py-2 border rounded"
								required
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 mb-2">Description</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-3 py-2 border rounded"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div>
								<label className="block text-gray-700 mb-2">Subject *</label>
								<select
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									className="w-full px-3 py-2 border rounded"
									required
								>
									<option value="">Select Subject</option>
									<option value="Mathematics">Mathematics</option>
									<option value="Science">Science</option>
									<option value="English">English</option>
									<option value="Hindi">Hindi</option>
									<option value="Social Studies">Social Studies</option>
									<option value="Computer Science">Computer Science</option>
									<option value="Other">Other</option>
								</select>
							</div>

							<div>
								<label className="block text-gray-700 mb-2">
									Grade/Class *
								</label>
								<select
									value={grade}
									onChange={(e) => setGrade(e.target.value)}
									className="w-full px-3 py-2 border rounded"
									required
								>
									<option value="">Select Grade</option>
									<option value="1">Class 1</option>
									<option value="2">Class 2</option>
									<option value="3">Class 3</option>
									<option value="4">Class 4</option>
									<option value="5">Class 5</option>
									<option value="6">Class 6</option>
									<option value="7">Class 7</option>
									<option value="8">Class 8</option>
									<option value="9">Class 9</option>
									<option value="10">Class 10</option>
									<option value="11">Class 11</option>
									<option value="12">Class 12</option>
								</select>
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 mb-2">Language</label>
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className="w-full px-3 py-2 border rounded"
							>
								<option value="English">English</option>
								<option value="Hindi">Hindi</option>
								<option value="Tamil">Tamil</option>
								<option value="Telugu">Telugu</option>
								<option value="Bengali">Bengali</option>
								<option value="Marathi">Marathi</option>
								<option value="Gujarati">Gujarati</option>
								<option value="Kannada">Kannada</option>
								<option value="Malayalam">Malayalam</option>
								<option value="Punjabi">Punjabi</option>
								<option value="Other">Other</option>
							</select>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 mb-2">Upload File *</label>
							<input
								type="file"
								onChange={handleFileChange}
								className="w-full px-3 py-2 border rounded"
								accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png"
								required
							/>
							<p className="text-sm text-gray-500 mt-1">
								Supported formats: PDF, Word, PowerPoint, Video, Audio, Images
							</p>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 mb-2">File Type</label>
							<div className="flex space-x-4">
								<label className="flex items-center">
									<input
										type="radio"
										name="fileType"
										value="document"
										checked={fileType === "document"}
										onChange={() => setFileType("document")}
										className="mr-2"
									/>
									Document
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="fileType"
										value="video"
										checked={fileType === "video"}
										onChange={() => setFileType("video")}
										className="mr-2"
									/>
									Video
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="fileType"
										value="image"
										checked={fileType === "image"}
										onChange={() => setFileType("image")}
										className="mr-2"
									/>
									Image
								</label>
							</div>
						</div>

						{isUploading && (
							<div className="mb-4">
								<div className="w-full bg-gray-200 rounded-full h-2.5">
									<div
										className="bg-blue-600 h-2.5 rounded-full"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
								<p className="text-sm text-gray-600 mt-1">
									Uploading: {uploadProgress}%
								</p>
							</div>
						)}

						<div className="flex justify-end space-x-4">
							<button
								type="button"
								onClick={() => router.back()}
								className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
								disabled={isUploading}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
								disabled={isUploading}
							>
								{isUploading ? "Uploading..." : "Upload Lesson"}
							</button>
						</div>
					</form>
				</div>
			</main>
		</>
	);
}
