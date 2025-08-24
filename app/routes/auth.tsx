import { usePuterStore } from '~/lib/puter';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';


export const meta = () => [
	{ title: 'Resume.ai | Auth' },
	{ name: 'description', content: 'Log into your account!' },
];

const Auth = () => {
	const { isLoading, auth } = usePuterStore(); // auth state + actions from store
	const location = useLocation(); // get current route info
	const navigate = useNavigate(); // programmatic navigation
	const next = location.search.split('next=')[1]; // extract redirect path from query

	// redirect if user is already authenticated
	useEffect(() => {
		if (auth.isAuthenticated) navigate(next);
	}, [auth.isAuthenticated, next]);

	return (
		<>
			{/* background layout */}
			<main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
				<div className="gradient-border shadow-lg">
					<section className="flex flex-col gap-10 bg-white rounded-2xl p-10">
						{/* header text */}
						<div className="flex flex-col items-center gap-2 text-center">
							<h1>Welcome</h1>
							<h2>Log In to Continue Your Job Journey</h2>
						</div>

						{/* auth actions */}
						<div>
							{isLoading ? (
								// loading state (disable interaction)
								<button className="auth-button animate-pulse">
									<p>Signing you in...</p>
								</button>
							) : (
								<>
									{auth.isAuthenticated ? (
										// show logout button if logged in
										<button
											className="auth-button"
											onClick={auth.signOut}
										>
											<p>Log Out</p>
										</button>
									) : (
										// show login button if not logged in
										<button
											className="auth-button"
											onClick={auth.signIn}
										>
											<p>Log In</p>
										</button>
									)}
								</>
							)}
						</div>
					</section>
				</div>
			</main>
		</>
	);
};

export default Auth;
