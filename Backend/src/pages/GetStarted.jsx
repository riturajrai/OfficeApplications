import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-[12px]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-600 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
            Get Started with QRVibe
          </h1>
          <p className="text-lg sm:text-xl text-pink-100 dark:text-pink-200 mb-8 max-w-3xl mx-auto">
            Transform your application processes with secure, location-verified QR technology
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/usage')}
              className="px-6 py-3 bg-white text-pink-600 dark:text-pink-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Contact Us
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-500 dark:to-purple-500 animate-pulse"></div>
      </section>

      {/* Options Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            How to Begin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <QrCodeIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mr-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  As a User
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scan a QR code provided by an organization to submit applications, register for events, or access venues.
              </p>
              <button
                onClick={() => navigate('/usage')}
                className="flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
              >
                Learn how to scan <ArrowRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mr-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  As an Organization
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate your own QR codes to streamline applications, registrations, and access control for your services.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
              >
                Get started <ArrowRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            Why Choose QRVibe?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <QrCodeIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
                title: "Secure Submissions",
                desc: "Encrypted QR codes ensure data protection"
              },
              {
                icon: <ChartBarIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
                title: "Easy Management",
                desc: "Streamline your application processes"
              },
              {
                icon: <UserGroupIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
                title: "User Friendly",
                desc: "Simple scanning for all users"
              },
              {
                icon: <EnvelopeIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
                title: "Instant Notifications",
                desc: "Real-time updates for submissions"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-3">
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pink-600 dark:bg-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Processes?
          </h2>
          <p className="text-lg text-pink-100 dark:text-pink-200 mb-8 max-w-2xl mx-auto">
            Whether you're submitting applications or managing them, QRVibe makes it secure and simple.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/usage')}
              className="px-6 py-3 bg-white text-pink-600 dark:text-pink-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Learn More
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
    </div>
  );
}