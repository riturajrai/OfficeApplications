import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  MapPinIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-[12px]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-600 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
            Welcome to QRVibe
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
            Simplify your applications with QRVibe’s secure, location-smart QR code technology. Submit forms, register for events, or access venues effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="px-6 py-3 bg-white text-pink-600 dark:text-pink-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/usage')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-500 dark:to-purple-500 animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            Why QRVibe Stands Out
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <QrCodeIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Secure QR Codes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                Unique QR codes ensure only authorized users can access and submit application forms securely.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <MapPinIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Location Validation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                Verify your location to ensure submissions are made from the right place, enhancing security.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <CheckCircleIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Instant Passes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                Receive a unique pass instantly after submission for entry or tracking purposes.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <DocumentTextIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Easy Form Submission
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                User-friendly forms make submitting applications quick and hassle-free for all users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            How QRVibe Works
          </h2>
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-4">
                <QrCodeIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  1. Scan the QR Code
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use your smartphone’s camera or a QR scanner app to access the secure application form provided by the organization. The QR code acts as a key to ensure only authorized users proceed.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-4">
                <MapPinIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  2. Allow Location Access
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enable location services to verify you’re within the organization’s designated area, adding an extra layer of security to your submission.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-4">
                <DocumentTextIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  3. Fill & Submit Form
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete the user-friendly form with your details, such as name, email, and optional documents like a resume, then submit securely.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 rounded-full p-4">
                <CheckCircleIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  4. Receive Your Pass
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get instant confirmation and a unique pass for entry, event registration, or application tracking.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/usage')}
              className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              See Detailed Guide
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            Benefits of Using QRVibe
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                For Applicants & Visitors
              </h3>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Quick Submission</span>: Complete and submit forms in minutes using a simple, intuitive interface.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Secure Process</span>: Your data is protected with encrypted QR codes and secure server communication.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Instant Confirmation</span>: Receive a pass immediately after submission for seamless entry or tracking.
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                For Organizations
              </h3>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Controlled Access</span>: Location validation ensures only authorized users at specific locations can submit forms.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Efficient Management</span>: Streamline visitor registration, job applications, or event check-ins with digital passes.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Customizable Forms</span>: Tailor forms to collect specific data, such as resumes or event details, with ease.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <UsersIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 text-center italic">
                “QRVibe made event registration a breeze. Attendees scanned QR codes at the venue, and the location check ensured smooth check-ins. Highly recommend!”
              </p>
              <p className="text-gray-800 dark:text-white font-semibold text-center mt-4">
                Priya Sharma, Event Organizer
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <UsersIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 text-center italic">
                “Applying for a job was so easy with QRVibe. I scanned the QR code, filled out the form, and got my pass instantly. It’s super user-friendly!”
              </p>
              <p className="text-gray-800 dark:text-white font-semibold text-center mt-4">
                Vikram Singh, Job Applicant
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <UsersIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 text-center italic">
                “We use QRVibe for visitor management at our office. The location validation ensures only authorized visitors submit forms. It’s a game-changer!”
              </p>
              <p className="text-gray-800 dark:text-white font-semibold text-center mt-4">
                Anjali Gupta, HR Manager
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pink-600 dark:bg-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience QRVibe?
          </h2>
          <p className="text-lg text-gray-100 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Start submitting applications, registering for events, or managing access with QRVibe’s secure and efficient platform.
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
              Contact Us
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
                Simplifying secure applications with QR codes and location validation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-[12px]">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'How It Works', path: '/usage' },
                  { name: 'About QRVibe', path: '/about' },
                  { name: 'Get Started', path: '/get-started' },
                  { name: 'FAQ', path: '/faq' },
                  { name: 'Contact Us', path: '/contact' },
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
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <p className="text-gray-400 text-[12px]">
                Email: <a href="mailto:support@qrvibe.com" className="hover:text-pink-400 transition-colors duration-200">support@qrvibe.com</a>
              </p>
              <p className="text-gray-400 text-[12px] mt-2">
                Phone: +91-123-456-7890
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 4.308 1.784 9.165 1.418 12-1 1.989-.233 3.675-1.384 4-3 0 0 .575-3.375-1-6z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400 text-[12px]">
              © {new Date().getFullYear()} QRVibe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}