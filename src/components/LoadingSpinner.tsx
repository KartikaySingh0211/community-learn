export default function LoadingSpinner() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
		</div>
	);
}
