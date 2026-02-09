import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DemoModal from '../components/DemoModal';

const Landing = () => {
  const [isDemoOpen, setDemoOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (window.scrollY > 50) {
        navbar?.classList.add('nav-scrolled');
        setShowBackToTop(true);
      } else {
        navbar?.classList.remove('nav-scrolled');
        setShowBackToTop(false);
      }
    };

    const counterSection = document.querySelector('.bg-indigo-50');
    const counters = document.querySelectorAll('.counter-number');
    let animated = false;

    const animateCounters = () => {
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        let count = 0;
        const speed = 200;
        const increment = target / speed;
        const updateCount = () => {
          count += increment;
          if (count < target) {
            counter.innerText = Math.ceil(count);
            requestAnimationFrame(updateCount);
          } else {
            counter.innerText = target;
          }
        };
        updateCount();
      });
    };

    const observer = new IntersectionObserver(entries => {
      if (!animated && entries[0].isIntersecting) {
        animateCounters();
        animated = true;
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (counterSection) {
      observer.observe(counterSection);
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('active');
      });
    });
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>ScriptSense - AI-Powered OCR Recognition</title>
      </Helmet>

      <DemoModal isOpen={isDemoOpen} onClose={() => setDemoOpen(false)} />

      {/* --- Navigation --- */}
      <nav id="navbar" className="fixed w-full z-50 bg-gradient-to-b from-black to-transparent px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="nav-link text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">ScriptSense</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="nav-link text-white hover:text-purple-400">Features</a>
            <a href="#how-it-works" className="nav-link text-white hover:text-purple-400">How It Works</a>
            <a href="#faq" className="nav-link text-white hover:text-purple-400">FAQ</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="nav-link text-white hover:text-purple-400">
                Login
            </Link>

            <Link to="/signup" className="btn-primary px-6 py-2 rounded-full font-medium">
                Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="hero-section">
        <video autoPlay muted loop className="hero-video-bg">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-pen-and-writing-on-a-notebook-17345-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay-bg"></div>

        <div className="max-w-4xl mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Transform Handwriting to Digital Text
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            ScriptSense uses advanced AI to convert your handwritten notes, documents, and forms into editable, searchable digital text with unparalleled accuracy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="btn-primary px-8 py-4 rounded-full text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg">
              <i className="fas fa-rocket mr-2"></i> Get Started
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="btn-secondary px-8 py-4 rounded-full text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300"
            >
              <i className="fas fa-play-circle mr-2"></i> Watch Demo
            </button>
          </div>
          <div className="mt-20 scroll-down">
            <a href="#features" className="text-gray-400 hover:text-white">
              <i className="fas fa-chevron-down text-2xl"></i>
            </a>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our AI-powered OCR technology offers cutting-edge features that set us apart.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: 'fas fa-brain',
                title: 'Advanced AI Recognition',
                description: 'Our proprietary neural networks can decipher even the most challenging handwriting styles with 98% accuracy.'
              },
              {
                icon: 'fas fa-language',
                title: 'Multi-language Support',
                description: 'Supports over 50 languages including right-to-left scripts like Arabic and complex character sets like Chinese.'
              },
              {
                icon: 'fas fa-shield-alt',
                title: 'Enterprise-grade Security',
                description: 'All documents are encrypted end-to-end with zero data retention policies for sensitive information.'
              },
              {
                icon: 'fas fa-magic',
                title: 'Smart Formatting',
                description: 'Automatically detects and preserves tables, lists, and document structure from your handwritten notes.'
              },
              {
                icon: 'fas fa-cloud-upload-alt',
                title: 'Cloud & API Access',
                description: 'Integrate with our API for bulk processing or use our web platform for individual document conversion.'
              },
              {
                icon: 'fas fa-history',
                title: 'Version History',
                description: 'Track changes and revert to previous versions of your documents with our comprehensive history feature.'
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card p-8 relative hover-grow">
                <div className={`glow ${index % 2 === 0 ? '-top-20 -right-20' : '-bottom-20 -left-20'}`}></div>
                <div className="feature-icon mb-6 mx-auto">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="flex items-center justify-center text-purple-600 font-medium">
                  <span>Learn more</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="counter-item text-center p-6 rounded-xl">
              <div className="counter-number" data-count="98">0</div>
              <div className="counter-label text-lg font-medium text-gray-700">Accuracy Rate</div>
            </div>
            <div className="counter-item text-center p-6 rounded-xl">
              <div className="counter-number" data-count="50">0</div>
              <div className="counter-label text-lg font-medium text-gray-700">Languages Supported</div>
            </div>
            <div className="counter-item text-center p-6 rounded-xl">
              <div className="counter-number" data-count="10000">0</div>
              <div className="counter-label text-lg font-medium text-gray-700">Happy Customers</div>
            </div>
            <div className="counter-item text-center p-6 rounded-xl">
              <div className="counter-number" data-count="24">0</div>
              <div className="counter-label text-lg font-medium text-gray-700">Processing Speed (hrs)</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How ScriptSense Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Convert your handwritten documents in just three simple steps.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="relative floating-element">
                <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-purple-600/20 blur-3xl"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-indigo-600/20 blur-3xl"></div>
                <div className="bg-white rounded-2xl p-2 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 relative z-10">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" alt="App interface" className="rounded-xl w-full" />
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-8">
              {[
                {
                  number: 1,
                  title: 'Upload Your Document',
                  description: 'Take a photo or scan your handwritten notes, or upload existing images/PDFs from your device or cloud storage.'
                },
                {
                  number: 2,
                  title: 'AI Processing',
                  description: 'Our advanced algorithms analyze and convert your handwriting to digital text while preserving the original layout.'
                },
                {
                  number: 3,
                  title: 'Edit & Export',
                  description: 'Review and edit the converted text, then export to your preferred format (DOCX, PDF, TXT) or share directly.'
                }
              ].map((step, index) => (
                <div key={index} className="how-it-works-card p-6 rounded-xl flex items-start hover-grow">
                  <div className="step-number mr-6 flex-shrink-0">
                    <span>{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}

              <div className="mt-8">
                <button
                  onClick={() => setDemoOpen(true)}
                  className="btn-primary inline-flex items-center px-8 py-3 rounded-full text-white font-bold text-lg hover-grow"
                >
                  <i className="fas fa-play-circle mr-2"></i> See Live Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section id="faq" className="py-20 bg-indigo-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find answers to common questions about ScriptSense.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How accurate is ScriptSense compared to other OCR tools?',
                answer: 'ScriptSense outperforms traditional OCR tools by 30-40% when it comes to handwritten text recognition. Our AI models are specifically trained on diverse handwriting samples, achieving an average accuracy of 98% for clear handwriting and 92% for challenging scripts.'
              },
              {
                question: 'Can I use ScriptSense for historical documents?',
                answer: 'Yes! We offer specialized models for historical documents that account for faded ink, unusual writing styles, and archaic language. For best results with very old documents, we recommend our Professional or Enterprise plans which include manual review options.'
              },
              {
                question: 'What file formats does ScriptSense support?',
                answer: 'We accept JPG, PNG, PDF, and TIFF files for input. Output options include editable DOCX, searchable PDF, plain TXT, and JSON for API users. Our Enterprise plan also supports bulk processing of ZIP files containing multiple documents.'
              },
              {
                question: 'Is my data secure with ScriptSense?',
                answer: 'Absolutely. We use end-to-end encryption for all document transfers and storage. For added security, Enterprise customers can choose our zero-retention processing option where documents are automatically deleted after conversion. We are GDPR, HIPAA, and SOC 2 compliant.'
              },
              {
                question: 'Can I integrate ScriptSense with other apps?',
                answer: 'Yes! Our API allows integration with popular platforms like Google Drive, Dropbox, Evernote, and Microsoft Office. We also offer pre-built integrations for Notion, Slack, and Zapier. Developers can access our full API documentation to build custom integrations.'
              }
            ].map((faq, index) => (
              <div key={index} className="faq-item rounded-xl p-6 cursor-pointer hover-grow">
                <div className="flex justify-between items-center">
                  <h3 className="faq-question text-xl font-bold text-gray-900">{faq.question}</h3>
                </div>
                <div className="faq-answer mt-4 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Still have questions?</p>
            <a href="#" className="btn-primary inline-flex items-center px-8 py-3 rounded-full text-white font-bold">
              <i className="fas fa-envelope mr-2"></i> Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Your Handwriting?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">Join thousands of professionals who trust ScriptSense for their document conversion needs.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg">
              <i className="fas fa-rocket mr-2"></i> Get Started Free
            </Link>
            <a href="#" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transform hover:scale-105 transition-transform duration-300 border border-white/20">
              <i className="fas fa-book mr-2"></i> Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* --- Footer Section --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <span className="nav-link text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">ScriptSense</span>
              </div>
              <p className="text-gray-400 mb-6">Advanced AI-powered OCR for handwritten documents. Transform your notes into digital text with unparalleled accuracy.</p>
              <div className="flex space-x-4">
                <a href="#" className="social-icon text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-icon text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="social-icon text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="social-icon text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-6">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Webinars</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2025 ScriptSense . All rights reserved.
            </div>

            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <button
          id="backToTop"
          onClick={handleBackToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </>
  );
};

export default Landing;