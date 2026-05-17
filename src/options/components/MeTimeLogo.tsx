import React from "react";

export function MeTimeLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 200"
      width="100%"
      height="100%"
      aria-label="MeTime"
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');
          .logo-text {
            font-family: 'Nunito', sans-serif;
            font-size: 150px;
            font-weight: 900;
            letter-spacing: -2px;
          }
        `}</style>
        <linearGradient id="metimeGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563eb" />
          <stop offset="0.45" stop-color="#a855f7" />
          <stop offset="1" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="logo-text"
        fill="url(#metimeGradient)"
      >
        MeTime
      </text>
    </svg>
  );
}
