import React from 'react';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';
import AnnualProgressChart from '../components/charts/AnnualProgressChart';
import StatsCards from '../components/charts/StatsCards';
import MoodTrackingGrid from '../components/charts/MoodTrackingGrid';
import MonthlyActivityChart from '../components/charts/MonthlyActivityChart';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function StatsPage() {
  return (
    <div className="w-full min-h-screen">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-10">
        {/* How it works */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-normal text-[#70B8FF]">How it works?</h2>
          <p className="text-base md:text-lg max-w-3xl text-[#88AACC]">
            Breathe guides you through calming breathing exercises with a visual cue — a softly expanding and contracting circle. Just follow its rhythm: inhale as it grows, exhale as it shrinks. In a few minutes, you'll feel more relaxed, focused, and balanced.
          </p>
        </div>

        {/* Weekly Activity */}
        <div className="w-full">
          <WeeklyActivityChart />
        </div>

        {/* Annual Progress */}
        <div className="w-full">
          <AnnualProgressChart />
        </div>

        {/* Metric Cards */}
        <div className="w-full">
          <StatsCards />
        </div>

        {/* Bottom charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="w-full"><MoodTrackingGrid /></div>
          <div className="w-full"><MonthlyActivityChart /></div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
