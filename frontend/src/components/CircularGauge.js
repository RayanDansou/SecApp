import React, { useState, useEffect, useRef } from 'react';
import './CircularGauge.css';

const CircularGauge = ({ value, label, maxValue = 100 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const gaugeRef = useRef(null);

  // Calculer le pourcentage
  const percentage = (value / maxValue) * 100;

  // Paramètres du cercle
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI; // Cercle complet

  // Calculer le stroke-dashoffset pour l'animation
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  // Intersection Observer pour détecter quand l'élément est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (gaugeRef.current) {
      observer.observe(gaugeRef.current);
    }

    return () => {
      if (gaugeRef.current) {
        observer.unobserve(gaugeRef.current);
      }
    };
  }, [isVisible]);

  // Animation du remplissage
  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const duration = 1500; // 1.5 secondes
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = easeOut * percentage;

        setAnimatedValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isVisible, percentage]);

  return (
    <div className="circular-gauge" ref={gaugeRef}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="gauge-svg"
      >
        {/* Cercle de fond (gris) */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
        />

        {/* Cercle de progression (coloré) */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className="gauge-progress"
          transform={`rotate(-90 ${radius} ${radius})`}
        />

        {/* Gradient pour la couleur */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D8FDB" />
            <stop offset="100%" stopColor="#0B7AC2" />
          </linearGradient>
        </defs>
      </svg>

      <div className="gauge-content">
        <div className="gauge-value">{Math.round((animatedValue / 100) * value)}</div>
        <div className="gauge-label">{label}</div>
      </div>
    </div>
  );
};

export default CircularGauge;
