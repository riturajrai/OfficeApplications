import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function Usage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-[12px]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-600 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
            How to Use QRVibe
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
            Your secure, location-smart platform for submitting applications and generating passes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="px-6 py-3 bg-white text-pink-600 dark:text-pink-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Back to Home
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-500 dark:to-purple-500 animate-pulse"></div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Introduction */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <InformationCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Welcome to QRVibe
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                QRVibe is a state-of-the-art platform designed to simplify and secure application processes, such as job interviews, visitor registrations, or event access, using QR codes and location-based validation.
              </p>
              <p>
                Whether you're applying for a job, requesting a visitor pass, or registering for an event, QRVibe provides a seamless experience with a modern, user-friendly interface. Our platform uses advanced geolocation technology to verify your location, ensuring you're at the right place to submit your application.
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <InformationCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Before You Begin
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>To ensure a smooth experience with QRVibe, make sure you have the following ready before starting:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <span className="font-medium">A Valid QR Code</span>: Obtain a QR code from the organization (e.g., employer, event organizer).
                </li>
                <li>
                  <span className="font-medium">A Compatible Device</span>: Use a smartphone, tablet, or computer with a modern web browser.
                </li>
                <li>
                  <span className="font-medium">QR Code Scanner</span>: Most smartphones have built-in QR scanning via the camera app.
                </li>
                <li>
                  <span className="font-medium">Location Services Enabled</span>: Ensure your device's location services are turned on.
                </li>
              </ul>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <InformationCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Step-by-Step Instructions
              </h2>
            </div>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-3">
                    <QrCodeIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      1. Scan the QR Code
                    </h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400">
                      <p>Your journey with QRVibe begins by scanning a unique QR code provided by the organization.</p>
                      <p className="font-medium">How to Scan the QR Code:</p>
                      <ol className="list-decimal list-inside space-y-2 pl-4">
                        <li>Open your smartphone's camera app</li>
                        <li>Point the camera at the QR code until a notification or link appears</li>
                        <li>Tap the link to open the QRVibe form in your browser</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-3">
                    <MapPinIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      2. Allow Location Access
                    </h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400">
                      <p>After scanning the QR code, QRVibe will prompt you to allow access to your device's location.</p>
                      <p className="font-medium">How to Allow Location Access:</p>
                      <ol className="list-decimal list-inside space-y-2 pl-4">
                        <li>When your browser displays a location access prompt, click "Allow"</li>
                        <li>Ensure your device's location services are enabled in your settings</li>
                        <li>Wait a few seconds while QRVibe retrieves your coordinates</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-3">
                    <DocumentTextIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      3. Fill Out the Application Form
                    </h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400">
                      <p>Once your location is validated, the QRVibe application form appears.</p>
                      <p className="font-medium">Form Fields Explained:</p>
                      <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><span className="font-medium">Name (Required)</span>: Enter your full name</li>
                        <li><span className="font-medium">Email (Required)</span>: Provide a valid email address</li>
                        <li><span className="font-medium">Reason (Optional)</span>: Describe the purpose of your application</li>
                        <li><span className="font-medium">Application Type (Required)</span>: Choose from available options</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-3">
                    <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      4. Submit and Receive Your Pass
                    </h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400">
                      <p>After filling out the form, click the "Submit Application" button to send your details.</p>
                      <p className="font-medium">What the Pass Does:</p>
                      <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>Entry to the organization's premises</li>
                        <li>Tracking your application status</li>
                        <li>Further communication with the organization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ExclamationTriangleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Troubleshooting Common Issues
              </h2>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl">
                <p className="font-medium text-red-600 dark:text-red-400 mb-2">
                  "Unable to retrieve your location" Error
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 pl-4">
                  <li>Refresh the page and click "Allow" when prompted for location access</li>
                  <li>Enable location services in your device settings</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-xl">
                <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                  "You are not within the allowed range" Error
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 pl-4">
                  <li>Move closer to the organization's location</li>
                  <li>Check the QR code's instructions for exact location requirements</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl">
                <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                  "Failed to submit form" Error
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 pl-4">
                  <li>Check that all required fields are filled correctly</li>
                  <li>Ensure your resume is in the correct format and under 5MB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <InformationCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="font-medium text-gray-800 dark:text-white">
                  Q: Do I need an account to use QRVibe?
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  No, QRVibe's form submission is public and doesn't require an account.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="font-medium text-gray-800 dark:text-white">
                  Q: What happens if I'm not in the location range?
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  You'll see an "Access Denied" message and won't be able to submit the form.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="font-medium text-gray-800 dark:text-white">
                  Q: What file types are supported for resume uploads?
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  QRVibe accepts PDF, DOC, and DOCX files, with a maximum size of 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <EnvelopeIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Contact QRVibe Support
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>If you encounter any issues or have questions about using QRVibe, our support team is here to help.</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <span className="font-medium">Email</span>: support@qrvibe.com
                </li>
                <li>
                  <span className="font-medium">Response Time</span>: Within 24 hours on business days
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pink-600 dark:bg-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Try QRVibe?
          </h2>
          <p className="text-lg text-gray-100 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Experience the future of secure, location-based applications today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="px-6 py-3 bg-white text-pink-600 dark:text-pink-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Get Started Now
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">QRVibe</h3>
              <p className="text-gray-400 text-[12px]">
                Secure, location-validated QR solutions for the modern world.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-[12px]">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'About', path: '/about' },
                  { name: 'How It Works', path: '/usage' },
                  { name: 'Get Started', path: '/get-started' },
                  { name: 'FAQ', path: '/faq' },
                  { name: 'Contact', path: '/contact' },
                ].map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-gray-400 hover:text-pink-400 transition-colors duration-200"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-[12px]">
                {[
                  { name: 'Privacy Policy', path: '/privacy' },
                  { name: 'Terms of Service', path: '/terms' },
                  { name: 'Security', path: '/security' },
                ].map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-gray-400 hover:text-pink-400 transition-colors duration-200"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <p className="text-gray-400 text-[12px] mb-2">
                <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                <a href="mailto:hello@qrvibe.com" className="hover:text-pink-400 transition-colors duration-200">
                  hello@qrvibe.com
                </a>
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 4.308 1.784 9.165 1.418 12-1 1.989-.233 3.675-1.384 4-3 0 0 .575-3.375-1-6z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400 text-[12px]">
              © {new Date().getFullYear()} QRVibe Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}