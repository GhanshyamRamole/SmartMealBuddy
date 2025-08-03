import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  Package, 
  Users, 
  Clock, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Meal Planning',
      description: 'Generate personalized weekly meal plans based on your dietary preferences and goals.',
    },
    {
      icon: ChefHat,
      title: 'Recipe Discovery',
      description: 'Discover thousands of recipes tailored to your taste and dietary restrictions.',
    },
    {
      icon: ShoppingCart,
      title: 'Auto Grocery Lists',
      description: 'Automatically generate grocery lists from your meal plans and sync with online stores.',
    },
    {
      icon: Package,
      title: 'Pantry Management',
      description: 'Track your pantry inventory and get recipe suggestions based on what you have.',
    },
  ];

  const benefits = [
    'Save time on meal planning and grocery shopping',
    'Reduce food waste with smart pantry tracking',
    'Discover new recipes that match your preferences',
    'Stay on track with your health and fitness goals',
    'Streamline your cooking routine',
  ];

  const stats = [
    { number: '10,000+', label: 'Recipes Available' },
    { number: '5,000+', label: 'Happy Users' },
    { number: '50,000+', label: 'Meals Planned' },
    { number: '99%', label: 'User Satisfaction' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Smart
              <span className="text-primary-600"> Meal Planning</span>
              <br />
              Companion
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plan meals, discover recipes, manage your pantry, and create grocery lists - all in one intelligent platform designed to make cooking effortless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary btn-lg inline-flex items-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="btn-outline btn-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smart Meal Planning
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From meal planning to grocery shopping, we've got you covered with intelligent features that adapt to your lifestyle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose SmartMealBuddy?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of users who have transformed their cooking routine with our intelligent meal planning platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">This Week's Plan</h3>
                    <p className="text-sm text-gray-500">7 meals planned</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Monday - Breakfast</span>
                    <span className="text-xs text-gray-500">Avocado Toast</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Monday - Lunch</span>
                    <span className="text-xs text-gray-500">Caesar Salad</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Monday - Dinner</span>
                    <span className="text-xs text-gray-500">Grilled Salmon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Meal Planning?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of users who have already simplified their cooking routine. Start your free account today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary btn-lg inline-flex items-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Heart className="h-4 w-4 mr-1" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
