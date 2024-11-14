// pages/index.js
import { useEffect, useState, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { toast, Toaster } from 'react-hot-toast';
import { Button } from '../components/Button';
import { Building2, Clock, Phone, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const vapiRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallConnecting, setIsCallConnecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = useCallback((info) => {
    setDebugInfo((prev) => [...prev, `${new Date().toISOString()}: ${info}`]);
    console.log(info);
  }, []);

  useEffect(() => {
    setMounted(true);
    vapiRef.current = new Vapi('034e3a55-03e8-4a49-b1ef-99ac6034d92b');
    const vapiInstance = vapiRef.current;

    // Define handler functions
    const handleCallStart = () => {
      addDebugInfo('Call started successfully');
      setIsCallActive(true);
      setIsCallConnecting(false);
      toast.dismiss(); // Dismiss any existing loading toasts
      toast.success('Call connected!');
    };

    const handleCallEnd = () => {
      addDebugInfo('Call ended');
      setIsCallActive(false);
      setIsCallConnecting(false);
      toast.success('Call ended');
    };

    const handleError = (e) => {
      console.error('Vapi error:', e);
      const errorMessage = e.message || 'An unexpected error occurred.';
      addDebugInfo(`Vapi error: ${errorMessage}`);
      toast.dismiss(); // Dismiss any existing loading toasts
      toast.error(`An error occurred: ${errorMessage}`);
      setIsCallActive(false);
      setIsCallConnecting(false);
    };

    const handleSpeechStart = () => {
      addDebugInfo('Assistant started speaking');
      toast('Assistant is speaking...', { icon: '🗣️' });
    };

    // Add event listeners
    if (vapiInstance) {
      vapiInstance.on('call-start', handleCallStart);
      vapiInstance.on('call-end', handleCallEnd);
      vapiInstance.on('error', handleError);
      vapiInstance.on('speech-start', handleSpeechStart);
    }

    // Cleanup function
    return () => {
      if (vapiInstance) {
        vapiInstance.off('call-start', handleCallStart);
        vapiInstance.off('call-end', handleCallEnd);
        vapiInstance.off('error', handleError);
        vapiInstance.off('speech-start', handleSpeechStart);
      }
    };
  }, [addDebugInfo]);

  // You can implement additional debug logging here if needed
  // Removed the extra closing brace here

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      addDebugInfo('Microphone permission granted');
      return true;
    } catch (err) {
      addDebugInfo(`Microphone permission error: ${err}`);
      return false;
    }
  };

  const startCall = async () => {
    if (!vapiRef.current || isCallActive || isCallConnecting) return;

    addDebugInfo('Attempting to start call');
    setIsCallConnecting(true);

    const hasMicPermission = await checkMicrophonePermission();
    if (!hasMicPermission) {
      toast.error('Microphone permission is required. Please enable it and try again.');
      setIsCallConnecting(false);
      return;
    }

    const loadingToast = toast.loading('Connecting call...');

    try {
      await vapiRef.current.start('15e18564-fa58-4e9f-9583-8461f6e79980');
      // Don't set isCallConnecting to false here - let handleCallStart handle it
    } catch (error) {
      console.error('Failed to start call:', error);
      addDebugInfo(`Failed to start call: ${error}`);
      toast.error(`Failed to start call: ${error.message || 'An unexpected error occurred.'}`);
      setIsCallConnecting(false);
      toast.dismiss(loadingToast);
    }
  };

  const endCall = () => {
    if (vapiRef.current && isCallActive) {
      addDebugInfo('Attempting to end call');
      vapiRef.current.stop();
      setIsCallConnecting(false);
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const isMuted = vapiRef.current.isMuted();
      vapiRef.current.setMuted(!isMuted);
      addDebugInfo(`Call ${isMuted ? 'unmuted' : 'muted'}`);
      toast.success(`Call ${isMuted ? 'unmuted' : 'muted'}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
            >
              RealDigitalPro
            </Link>
            <div className="flex gap-6 items-center">
              <Link
                href="#about"
                className="text-sm hover:text-purple-400 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="#contact"
                className="text-sm hover:text-purple-400 transition-colors"
              >
                Contact Us
              </Link>
              <Button
                className={`border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all ${
                  isCallActive ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''
                }`}
                onClick={isCallActive ? endCall : startCall}
                disabled={isCallConnecting}
              >
                {isCallConnecting
                  ? 'Connecting...'
                  : isCallActive
                  ? 'End Call'
                  : 'Try It Now'}
              </Button>
              {isCallActive && (
                <Button onClick={toggleMute} className="ml-2">
                  {vapiRef.current?.isMuted() ? 'Unmute' : 'Mute'}
                </Button>
              )}
              {isCallActive && <span className="animate-pulse text-green-500">●</span>}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Main Content */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="space-y-8 text-center">
              <h1
                className={`text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent transition-opacity duration-1000 ${
                  mounted ? 'opacity-100' : 'opacity-0'
                }`}
              >
                Imagine an Assistant Who Never Sleeps
              </h1>
              <p
  className={`mt-4 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
  }`}
              >
                RealDigitalPro is built for real estate agents, offering 24/7 AI support to enhance client experience,
                manage schedules, generate leads, and even make calls on your behalf. This intelligent assistant keeps your
                business active around the clock, helping you reach more clients and close deals faster.
              </p>
              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <Button
                  className={`px-8 py-6 text-lg rounded-full ${
                    isCallActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  onClick={isCallActive ? endCall : startCall}
                  disabled={isCallConnecting}
                >
                  {isCallConnecting
                    ? 'Connecting...'
                    : isCallActive
                    ? 'End Call'
                    : 'Try It Now'}
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-6 text-lg rounded-full"
                >
                  Learn More
                </Button>
              </div>
              {isCallActive && (
                <p className="text-green-500 animate-pulse">Call is active. Speak now!</p>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-black to-purple-900/20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature Cards */}
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 transition-transform hover:scale-105">
                <Clock className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                <p className="text-gray-400">
                  Never miss an opportunity with round-the-clock client support.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 transition-transform hover:scale-105">
                <Users className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Lead Generation</h3>
                <p className="text-gray-400">
                  Automated lead generation and qualification system.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 transition-transform hover:scale-105">
                <Phone className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Calling</h3>
                <p className="text-gray-400">
                  AI-powered calling system that handles initial client contact.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 transition-transform hover:scale-105">
                <Building2 className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Property Management</h3>
                <p className="text-gray-400">
                  Efficient property listing and management tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            {/* ... (No changes needed here) */}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* ... (No changes needed here) */}
        </div>
      </footer>
    </div>
  );
}
