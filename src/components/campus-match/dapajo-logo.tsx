"use client";

import React from "react";

interface DapajoLogoProps {
  className?: string;
}

export function DapajoLogo({ className = "h-8 w-8" }: DapajoLogoProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={`${className} shrink-0 aspect-square`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Graduation Cap (Toga) Top */}
      <path d="M120 18L35 55L120 90L205 55L120 18Z" fill="#1e1b4b" />
      <path d="M65 68V95C65 95 88 112 120 112C152 112 175 95 175 95V68" fill="#1e1b4b" opacity="0.9" />
      {/* Tassel */}
      <path d="M192 60V100" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="192" cy="105" r="5" fill="#1e1b4b" />

      {/* Two Head Circles (Male Blue & Female Pink) */}
      <circle cx="85" cy="115" r="26" fill="#2563eb" />
      <circle cx="155" cy="115" r="26" fill="#ec4899" />

      {/* Heart Body Base Left (Vibrant Blue) */}
      <path
        d="M120 232 C 65 198, 35 160, 35 130 C 35 102, 60 88, 85 88 C 105 88, 120 102, 120 102 C 120 102, 135 88, 155 88 C 180 88, 205 102, 205 130 C 205 160, 175 198, 120 232 Z"
        fill="#2563eb"
      />

      {/* Right Overlap (Vibrant Pink/Rose) */}
      <path
        d="M120 232 C 175 198, 205 160, 205 130 C 205 102, 180 88, 155 88 C 135 88, 120 102, 120 102 Z"
        fill="#ec4899"
      />

      {/* Overlapping Deep Purple Center Intersection */}
      <path
        d="M120 232 C 144 198, 158 170, 158 145 C 158 125, 144 110, 128 110 C 122 110, 120 115, 120 115 C 120 115, 118 110, 112 110 C 96 110, 82 125, 82 145 C 82 170, 96 198, 120 232 Z"
        fill="#4c1d95"
      />

      {/* Center White Heart */}
      <path
        d="M120 196 C 135 174, 148 155, 148 142 C 148 128, 137 118, 127 118 C 122 118, 120 122, 120 122 C 120 122, 118 118, 113 118 C 103 118, 92 128, 92 142 C 92 155, 105 174, 120 196 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
