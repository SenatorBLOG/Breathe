// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaGithub, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0F1F] text-[#9CCBFF] border-t border-[#1E2F4F] py-3 px-6 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex flex-col items-center md:items-start">
          <Link
            to="/breathing"
            className="text-[#BCDDFF] text-lg font-medium hover:text-white transition-colors"
          >
            Breathe
          </Link>
          <p className="text-xs text-[#7FADEB] mt-0.5">
            © {new Date().getFullYear()} Breathe. All rights reserved.
          </p>
        </div>

        {/* Center Navigation Links */}
        <div className="flex flex-wrap justify-center gap-5 text-xs">
          <Link to="/profile" className="hover:text-white transition-colors">
            Profile
          </Link>
          <Link to="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link to="/support" className="hover:text-white transition-colors">
            Support
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9CCBFF] hover:text-white transition-colors"
          >
            <FaInstagram size={18} />
          </a>
          <a
            href="https://github.com/SenatorBLOG.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9CCBFF] hover:text-white transition-colors"
          >
            <FaGithub size={18} />
          </a>
          <a
            href="mailto:support@breatheapp.com"
            className="text-[#9CCBFF] hover:text-white transition-colors"
          >
            <FaEnvelope size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
