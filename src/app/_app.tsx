import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function MyApp({ Component, pageProps }: AppProps) {
	const { user, loading } = useAuth();
	const router = useRouter();

	// Auto-redirect logic for authentication
	useEffect(() => {
		if (!loading) {
			const { pathname } = router;

			// If user is logged in and trying to access auth pages, redirect to dashboard
			if (user && (pathname === "/" || pathname.startsWith("/auth"))) {
				router.replace(`/dashboard/${user.role}`);
			}
		}
	}, [user, loading, router]);

	return <Component {...pageProps} />;
}

export default MyApp;
