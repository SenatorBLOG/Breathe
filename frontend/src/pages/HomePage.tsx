import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="relative w-full min-h-screen bg-[#001F3F]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('/Background_img_Meditation.jpg')`
        }}
      />

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col items-center justify-center text-center py-12 px-4 sm:py-16 md:py-20 lg:py-24">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-normal leading-tight text-[#70B8FF] font-montserrat mb-4 tracking-wide">
            Breathe Better
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-[#88AACC] font-montserrat max-w-3xl">
            Meditation for Sleep & Relaxation
          </p>
        </header>

        {/* Navigation Bar */}
        <NavBar/>

        {/* How It Works Section */}
        <section className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-[#70B8FF] font-montserrat mb-8 text-center">
              How it works?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-[#88AACC] font-montserrat mb-12 text-center max-w-3xl mx-auto">
              Breathe guides you through calming breathing exercises with a visual cue — a softly expanding and contracting circle. Just follow its rhythm: inhale as it grows, exhale as it shrinks. In a few minutes, you'll feel more relaxed, focused, and balanced.
            </p>

            {/* Steps Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-[rgba(10,15,31,0.5)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
                  src="/icons/Spiral_png.png"
                  alt="Step 1 illustration"
                />
                <div className="flex flex-col">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-tight text-[#70B8FF] font-montserrat mb-2">
                    Step 1 — Feel the breath
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-[#88AACC] font-montserrat">
                    Press "Start" and follow the pulsating ball. Inhale and the balloon swells, exhale and deflates. A simple practice that instantly calms down.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-6 bg-[rgba(10,15,31,0.5)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
                  src="/icons/Constellation_png.png"
                  alt="Step 2 illustration"
                />
                <div className="flex flex-col">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-tight text-[#70B8FF] font-montserrat mb-2">
                    Step 2 — A Short Daily Habit
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-[#88AACC] font-montserrat">
                    3-5 minutes a day is enough to notice the effect. Short meditations for the morning, a break at work and before going to bed will help integrate breathing into everyday life.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-[rgba(10,15,31,0.5)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
                  src="/icons/Waves_png.png"
                  alt="Step 3 illustration"
                />
                <div className="flex flex-col">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-tight text-[#70B8FF] font-montserrat mb-2">
                    Step 3 — Monitor the progress
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-[#88AACC] font-montserrat">
                    The app has a session tracker, reminders, and achievements. You see how your health is changing, and you remain motivated to continue.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-6 bg-[rgba(10,15,31,0.5)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
                  src="/icons/Lotus_png.png"
                  alt="Step 4 illustration"
                />
                <div className="flex flex-col">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-tight text-[#70B8FF] font-montserrat mb-2">
                    Step 4 — Use your Breath in Life
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-[#88AACC] font-montserrat">
                    Before a meeting, in a dream, or when you feel tense, a few deep cycles will help you quickly regain calm.
                  </p>
                </div>
              </div>

            </div>

            {/* Start Button */}
            <div className="flex justify-center mt-12">
              <Link
                to="/breathing"
                className="w-24 h-24 rounded-full bg-[#3A82F7] flex items-center justify-center text-white text-2xl font-medium hover:bg-[#2970E5] transition-all duration-300 animate-pulse shadow-lg hover:shadow-xl"
              >
                Start
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
