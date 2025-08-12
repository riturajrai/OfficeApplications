import { useNavigate } from 'react-router-dom';
import {
  LightBulbIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-[12px]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-600 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
            About QRVibe
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
            Revolutionizing secure digital interactions with location-smart QR technology. Our mission is to simplify processes while enhancing security for both users and organizations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="px-6 py-3 bg-white text-pink-600 dark:text-pink-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Contact Team
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-500 dark:to-purple-500 animate-pulse"></div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                QRVibe was born out of a need to bridge the gap between physical and digital security. In 2023, our team recognized the growing demand for secure yet user-friendly solutions in application processes, event management, and access control.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We combined QR technology with location validation to create a platform that organizations trust and users love. Today, QRVibe powers thousands of secure interactions daily across various industries.
              </p>
              <button
                onClick={() => navigate('/usage')}
                className="mt-4 px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
              >
                Learn How It Works
              </button>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center">
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">10K+</p>
                  <p className="text-gray-600 dark:text-gray-400">Daily Scans</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center">
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">500+</p>
                  <p className="text-gray-600 dark:text-gray-400">Organizations</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center">
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">95%</p>
                  <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center">
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">24/7</p>
                  <p className="text-gray-600 dark:text-gray-400">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <LightBulbIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                We constantly push boundaries to create smarter, more intuitive solutions that anticipate user needs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <ShieldCheckIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                Your data's protection is our top priority. We implement robust encryption and validation protocols.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <GlobeAltIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Accessibility
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                We design for everyone. Our solutions work seamlessly across devices and technical skill levels.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <ClockIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Efficiency
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                We eliminate friction in processes, saving time for both users and organizations.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <UserGroupIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                User-Centric
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                Every feature is designed with real user experiences in mind, not just technical specifications.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <ChartBarIcon className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                Continuous Improvement
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                We never settle. Our team is always refining and enhancing based on user feedback and emerging needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            Meet The Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Aarav Patel',
                role: 'Founder & CEO',
                bio: 'Security expert with 10+ years in digital identity solutions. Passionate about bridging physical and digital security.',
                img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200'
              },
              {
                name: 'Neha Gupta',
                role: 'CTO',
                bio: 'Led engineering teams at top tech firms. Specializes in scalable, secure architectures.',
                img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200'
              },
              {
                name: 'Rohan Sharma',
                role: 'Product Lead',
                bio: 'User experience specialist focused on intuitive design and seamless workflows.',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
              },
              {
                name: 'Priya Singh',
                role: 'Growth Manager',
                bio: 'Connects organizations with solutions that truly meet their operational needs.',
                img: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?w=200'
              }
            ].map((member, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                  {member.name}
                </h3>
                <p className="text-pink-600 dark:text-pink-400 text-center mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors duration-300 text-[12px] shadow-md hover:scale-105"
            >
              Join Our Team
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pink-600 dark:bg-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Processes?
          </h2>
          <p className="text-lg text-gray-100 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Whether you're an organization looking for secure solutions or a user wanting seamless experiences, QRVibe has you covered.
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
              Contact Our Team
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
                  { name: 'Pricing', path: '/pricing' },
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