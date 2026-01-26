import React from 'react';

const Logo = ({ size = 40, showText = false, variant = 'default' }) => {
  // Couleurs basées sur le logo GuardianIQ
  const colors = {
    shield: '#0D8FDB',      // Bleu du bouclier
    brain: '#3B4D5C',       // Gris du cerveau
    textDark: '#2C3E50',    // Texte Guardian
    textBlue: '#0D8FDB',    // Texte IQ
    white: '#FFFFFF'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showText ? '12px' : '0' }}>
      {/* Logo Shield with Brain */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield */}
        <path
          d="M100 10 L180 45 L180 100 C180 145 145 175 100 190 C55 175 20 145 20 100 L20 45 Z"
          fill={variant === 'white' ? colors.white : colors.shield}
          stroke={variant === 'white' ? colors.shield : 'none'}
          strokeWidth={variant === 'white' ? '4' : '0'}
        />

        {/* Inner Shield Background */}
        <path
          d="M100 30 L160 55 L160 100 C160 135 135 160 100 172 C65 160 40 135 40 100 L40 55 Z"
          fill={colors.white}
        />

        {/* Brain Icon */}
        <g transform="translate(100, 100)">
          {/* Left hemisphere */}
          <path
            d="M-25,-35 C-35,-35 -40,-28 -40,-20 C-40,-15 -38,-10 -35,-8 C-38,-5 -40,0 -40,5 C-40,12 -36,18 -30,20 C-32,22 -33,25 -33,28 C-33,33 -29,37 -24,38 C-20,39 -15,37 -13,33 C-10,35 -6,36 -2,36 L-2,25 C-5,25 -8,24 -11,22 C-9,20 -8,17 -8,14 C-8,10 -10,6 -14,4 C-12,2 -11,-1 -11,-4 C-11,-8 -13,-12 -17,-14 C-15,-16 -14,-19 -14,-22 C-14,-27 -18,-32 -25,-35 Z"
            fill={colors.brain}
          />

          {/* Right hemisphere */}
          <path
            d="M25,-35 C35,-35 40,-28 40,-20 C40,-15 38,-10 35,-8 C38,-5 40,0 40,5 C40,12 36,18 30,20 C32,22 33,25 33,28 C33,33 29,37 24,38 C20,39 15,37 13,33 C10,35 6,36 2,36 L2,25 C5,25 8,24 11,22 C9,20 8,17 8,14 C8,10 10,6 14,4 C12,2 11,-1 11,-4 C11,-8 13,-12 17,-14 C15,-16 14,-19 14,-22 C14,-27 18,-32 25,-35 Z"
            fill={colors.brain}
          />

          {/* Center line */}
          <line
            x1="0"
            y1="-35"
            x2="0"
            y2="38"
            stroke={colors.white}
            strokeWidth="2"
          />

          {/* Brain details - left */}
          <path
            d="M-20,-25 C-22,-22 -24,-19 -26,-16"
            stroke={colors.white}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-25,-10 C-27,-7 -28,-3 -28,0"
            stroke={colors.white}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-22,8 C-24,12 -25,16 -25,20"
            stroke={colors.white}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Brain details - right */}
          <path
            d="M20,-25 C22,-22 24,-19 26,-16"
            stroke={colors.white}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M25,-10 C27,-7 28,-3 28,0"
            stroke={colors.white}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M22,8 C24,12 25,16 25,20"
            stroke={colors.white}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      {/* Text Logo */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <span style={{
            fontSize: size * 0.6,
            fontWeight: 600,
            color: variant === 'light' ? colors.textDark : 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>
            Guardian
          </span>
          <span style={{
            fontSize: size * 0.6,
            fontWeight: 700,
            color: colors.textBlue,
            letterSpacing: '-0.5px'
          }}>
            IQ
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
