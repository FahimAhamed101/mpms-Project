'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState } from '@/app/lib/store';
import {
  CheckCircle,
  Users,
  BarChart3,
  CalendarDays,
  FolderKanban,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Cloud,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: FolderKanban,
      title: 'Project Management',
      description: 'Create, organize, and track projects with ease. Manage deadlines, budgets, and progress all in one place.',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your team. Assign tasks, share files, and communicate effectively.',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: CalendarDays,
      title: 'Sprint Planning',
      description: 'Plan and execute sprints efficiently. Track velocity, manage backlogs, and improve team productivity.',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get insights into project performance with detailed reports and real-time dashboards.',
      color: 'text-orange-600 bg-orange-50',
    },
    {
      icon: Shield,
      title: 'Role-based Security',
      description: 'Secure access control with Admin, Manager, and Member roles to protect your sensitive data.',
      color: 'text-red-600 bg-red-50',
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Store and access your project files from anywhere with secure cloud storage integration.',
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Project Manager',
      company: 'TechCorp Inc.',
      content: 'MPMS transformed how our team works. We\'ve increased productivity by 40% since implementation.',
      avatar: 'AJ',
    },
    {
      name: 'Sarah Williams',
      role: 'Team Lead',
      company: 'DesignStudio',
      content: 'The intuitive interface and powerful features make project management a breeze for our design team.',
      avatar: 'SW',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      company: 'StartUpXYZ',
      content: 'Perfect for growing teams. Scalable, reliable, and packed with all the features we need.',
      avatar: 'MC',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">MPMS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Project Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              A modern, minimal project management system designed for teams that value simplicity, efficiency, and collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
            </div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Dashboard */}
                <div className="md:col-span-2 bg-gray-900 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-gray-400">Dashboard</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[65, 42, 89].map((percent, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{percent}%</div>
                        <div className="text-xs text-gray-400">Progress</div>
                        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-40 bg-gray-800 rounded-lg"></div>
                </div>
                
                {/* Mock Task List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: 'Design Review', status: 'In Progress' },
                      { title: 'API Integration', status: 'Completed' },
                      { title: 'User Testing', status: 'Pending' },
                    ].map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.status}</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From project planning to team collaboration, MPMS provides all the tools your team needs to succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-8 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of teams who have transformed their project management with MPMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Project Management?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
            Join thousands of teams who have streamlined their workflow with MPMS. 
            Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-indigo-600 bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white border-2 border-white hover:bg-white/10 transition-colors"
            >
              Schedule a Demo
            </Link>
          </div>
          <p className="mt-8 text-sm text-indigo-200">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="ml-2 text-xl font-bold">MPMS</span>
              </div>
              <p className="text-gray-400">
                Minimal Project Management System for modern teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">GitHub</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} MPMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}