const iconProps = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconVer() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconDownload() {
  return (
    <svg {...iconProps}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function IconEditar() {
  return (
    <svg {...iconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconExcluir() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function IconMovimentar() {
  return (
    <svg {...iconProps}>
      <path d="m18 8 4 4-4 4" />
      <path d="M2 12h20" />
      <path d="m6 16-4-4 4-4" />
    </svg>
  );
}

export function IconReenviar() {
  return (
    <svg {...iconProps}>
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

const variantStyles = {
  default: {
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid #cbd5e1",
  },
  primary: {
    background: "#7fc1f5",
    color: "#fff",
    border: "none",
  },
  danger: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },
  warning: {
    background: "#fffbeb",
    color: "#b45309",
    border: "1px solid #fde68a",
  },
};

export default function IconButton({ title, onClick, variant = "default", children }) {
  const estilo = variantStyles[variant] || variantStyles.default;

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        padding: 0,
        borderRadius: "8px",
        cursor: "pointer",
        transition: "opacity 0.15s, transform 0.1s",
        ...estilo,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}
