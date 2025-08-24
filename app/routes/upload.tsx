import { type FormEvent, useState } from 'react';
import Navbar from '~/components/Navbar';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../constants';

const Upload = () => {
	const { auth, isLoading, fs, ai, kv } = usePuterStore(); // app services (auth, file storage, AI, key-value store)
	const navigate = useNavigate();
	const [isProcessing, setIsProcessing] = useState(false); // track analysis state
	const [statusText, setStatusText] = useState(''); // display step-by-step progress
	const [file, setFile] = useState<File | null>(null); // uploaded resume file

	// handler for file selection (from FileUploader)
	const handleFileSelect = (file: File | null) => {
		setFile(file);
	};

	// main resume analysis flow
	const handleAnalyze = async ({
		companyName,
		jobTitle,
		jobDescription,
		file,
	}: {
		companyName: string;
		jobTitle: string;
		jobDescription: string;
		file: File;
	}) => {
		setIsProcessing(true);

		// upload resume file
		setStatusText('Uploading the file...');
		const uploadedFile = await fs.upload([file]);
		if (!uploadedFile) return setStatusText('Error: Failed to upload file');

		// convert PDF -> image for preview
		setStatusText('Converting to image...');
		const imageFile = await convertPdfToImage(file);
		if (!imageFile.file)
			return setStatusText('Error: Failed to convert PDF to image');

		// upload converted image
		setStatusText('Uploading the image...');
		const uploadedImage = await fs.upload([imageFile.file]);
		if (!uploadedImage) return setStatusText('Error: Failed to upload image');

		// store initial resume data in KV store
		setStatusText('Preparing data...');
		const uuid = generateUUID();
		const data = {
			id: uuid,
			resumePath: uploadedFile.path,
			imagePath: uploadedImage.path,
			companyName,
			jobTitle,
			jobDescription,
			feedback: '',
		};
		await kv.set(`resume:${uuid}`, JSON.stringify(data));

		// request AI analysis
		setStatusText('Analyzing...');
		const feedback = await ai.feedback(
			uploadedFile.path,
			prepareInstructions({ jobTitle, jobDescription })
		);
		if (!feedback) return setStatusText('Error: Failed to analyze resume');

		// extract feedback text safely
		const feedbackText =
			typeof feedback.message.content === 'string'
				? feedback.message.content
				: feedback.message.content[0].text;

		// update data with feedback and persist
		data.feedback = JSON.parse(feedbackText);
		await kv.set(`resume:${uuid}`, JSON.stringify(data));

		// redirect to resume details page
		setStatusText('Analysis complete, redirecting...');
		console.log(data);
		navigate(`/resume/${uuid}`);
	};

	// form submit handler
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget.closest('form');
		if (!form) return;
		const formData = new FormData(form);

		const companyName = formData.get('company-name') as string;
		const jobTitle = formData.get('job-title') as string;
		const jobDescription = formData.get('job-description') as string;

		if (!file) return; // no file uploaded, exit early

		handleAnalyze({ companyName, jobTitle, jobDescription, file });
	};

	return (
		<main className="bg-[url('/images/bg-main.svg')] bg-cover">
			<Navbar />

			<section className="main-section">
				<div className="page-heading py-16">
					<h1>Smart feedback for your dream job</h1>

					{/* show status during processing */}
					{isProcessing ? (
						<>
							<h2>{statusText}</h2>
							<img
								src="/images/resume-scan.gif"
								className="w-full"
							/>
						</>
					) : (
						<h2>Drop your resume for an ATS score and improvement tips</h2>
					)}

					{/* show upload form only if not processing */}
					{!isProcessing && (
						<form
							id="upload-form"
							onSubmit={handleSubmit}
							className="flex flex-col gap-4 mt-8"
						>
							{/* company name input */}
							<div className="form-div">
								<label htmlFor="company-name">Company Name</label>
								<input
									type="text"
									name="company-name"
									placeholder="eg. IBM"
									id="company-name"
								/>
							</div>

							{/* job title input */}
							<div className="form-div">
								<label htmlFor="job-title">Job Title</label>
								<input
									type="text"
									name="job-title"
									placeholder="eg. Software Developer"
									id="job-title"
								/>
							</div>

							{/* job description input */}
							<div className="form-div">
								<label htmlFor="job-description">Job Description</label>
								<textarea
									rows={5}
									name="job-description"
									placeholder="eg. As an IBM Software Developer, you'll collaborate with cross-functional teams to deliver high-quality software..."
									id="job-description"
								/>
							</div>

							{/* file upload input */}
							<div className="form-div">
								<label htmlFor="uploader">Upload Resume</label>
								<FileUploader onFileSelect={handleFileSelect} />
							</div>

							{/* submit button */}
							<button
								className="primary-button"
								type="submit"
							>
								Analyze Resume
							</button>
						</form>
					)}
				</div>
			</section>
		</main>
	);
};
export default Upload;
