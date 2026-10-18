
export default function SpenVoltLogo({ width = 256, height = 302, className = "" }: { width?: number; height?: number; className?: string }) {
  return (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 302"
      width={width}
      height={height}
      className={className}
      fill="none"
      aria-label="Spenvolt"
      role="img"
    >
      <defs>
        {/* Gradiente verde */}
        <linearGradient
          id="green-gradient-1"
          gradientUnits="userSpaceOnUse"
          x2="1"
          gradientTransform="matrix(101.5,203,-266.217,133.108,41,49.5)"
        >
          <stop stopColor="var(--color-green-start)" />
          <stop offset="1" stopColor="var(--color-green-end)" />
        </linearGradient>

        {/* Gradiente azul */}
        <linearGradient
          id="blue-gradient-1"
          gradientUnits="userSpaceOnUse"
          x2="1"
          gradientTransform="matrix(-72.5,217.5,-115.061,-38.354,200.5,64)"
        >
          <stop stopColor="var(--color-blue-start)" />
          <stop offset="1" stopColor="var(--color-blue-end)" />
        </linearGradient>

        {/* Gradiente verde das peças superiores/inferiores */}
        <linearGradient
          id="green-gradient-2"
          gradientUnits="userSpaceOnUse"
          x2="1"
          gradientTransform="matrix(101.5,203,-210.25,105.125,41,49.5)"
        >
          <stop stopColor="var(--color-green-start)" />
          <stop offset="1" stopColor="var(--color-green-end)" />
        </linearGradient>

        {/* Gradiente azul das peças superiores/inferiores */}
        <linearGradient
          id="blue-gradient-2"
          gradientUnits="userSpaceOnUse"
          x2="1"
          gradientTransform="matrix(-72.5,217.5,-229.257,-76.419,200.5,64)"
        >
          <stop stopColor="var(--color-blue-start)" />
          <stop offset="1" stopColor="var(--color-blue-end)" />
        </linearGradient>
      </defs>

      {/* Arco verde */}
      <path
        fillRule="evenodd"
        d="m51.1 227.9c-17.5-17.5-28.5-40.5-31.2-65.1-2.7-24.6 3.1-49.4 16.4-70.2 13.3-20.9 33.3-36.6 56.7-44.6 23.5-7.9 48.9-7.7 72.2 0.8"
        fill="none"
        stroke="url(#green-gradient-1)"
        strokeWidth="37.7"
      />

      {/* Arco azul */}
      <path
        fillRule="evenodd"
        d="m195 65.3c20.4 15.9 34.4 38.6 39.6 64 5.2 25.4 1.1 51.8-11.5 74.4-12.5 22.7-32.7 40.1-57 49.2-24.3 9-51 9.2-75.3 0.3"
        fill="none"
        stroke="url(#blue-gradient-1)"
        strokeWidth="37.7"
      />

      {/* Peça verde superior */}
      <path
        fillRule="evenodd"
        d="m142.5 0.2v26.1h-29v-26.1z"
        fill="url(#green-gradient-2)"
      />

      {/* Peça azul inferior */}
      <path
        fillRule="evenodd"
        d="m142.5 275.7v26.1h-29v-26.1z"
        fill="url(#blue-gradient-2)"
      />

      {/* Raio amarelo */}
      <path
        fillRule="evenodd"
        d="m190.7 46.4l-120.1 117 44.3 2.8-50.1 88.8 117.9-129-35.5-2.3z"
        fill="var(--color-yellow)"
        stroke="var(--color-yellow)"
        strokeLinejoin="round"
        strokeWidth="7.3"
      />
    </svg>
  );
}