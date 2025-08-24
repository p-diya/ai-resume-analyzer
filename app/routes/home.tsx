import Navbar from '~/components/Navbar';
import type { Route } from './+types/home';
import { resumes } from '~/constants';
import ResumeCard from '~/components/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'Resume.ai' },
		{ name: 'description', content: 'Smart feedback for job applications!' },
	];
}

export default function Home() {
	const { auth } = usePuterStore(); // auth state from store
	const navigate = useNavigate();   // navigation hook

	// redirect to login if not authenticated
	useEffect(() => {
		if (!auth.isAuthenticated) navigate('/auth?next=/');
	}, [auth.isAuthenticated]);

	return (
		<>
			{/* background + main layout */}
			<main className="bg-[url('/images/bg-main.svg')] bg-cover">
				<Navbar />

				{/* hero section */}
				<section className="main-section">
					<div className="page-heading py-16">
						<h1 className="capitalize">
							Track your applications & resume ratings
						</h1>
						<h2>Review your submissions and check AI-powered feedback.</h2>
					</div>
				</section>

				{/* resume list section (only if resumes exist) */}
				{resumes.length > 0 && (
					<div className="resumes-section">
						{resumes.map((resume) => (
							<ResumeCard
								key={resume.id}
								resume={resume}
							/>
						))}
					</div>
				)}
			</main>
		</>
	);
}
