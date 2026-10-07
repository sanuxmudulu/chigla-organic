// Simple brand marks, drawn as inline SVG so they take the button's text colour.
// The TikTok mark is black in light mode and white in dark mode (see the button classes).

export type PlatformKey = "tiktok" | "instagram" | "youtube" | "facebook";

export function PlatformLogo({ platform, className = "h-4 w-4" }: { platform: PlatformKey; className?: string }) {
  if (platform === "youtube")
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#FF0000" />
        <path d="M10 8.9v6.2l5.4-3.1z" fill="#fff" />
      </svg>
    );
  if (platform === "instagram")
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="#E1306C" strokeWidth="2.4">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.3" />
        <circle cx="17.6" cy="6.4" r="1.1" fill="#E1306C" stroke="none" />
      </svg>
    );
  if (platform === "facebook")
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path d="M13.3 19v-5.6h1.9l.3-2.2h-2.2V9.8c0-.6.2-1.1 1.1-1.1h1.2V6.7c-.2 0-.9-.1-1.7-.1-1.7 0-2.9 1-2.9 2.9v1.7H9.2v2.2h1.9V19z" fill="#fff" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={`${className} text-black dark:text-white`} aria-hidden="true" fill="currentColor">
      <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.8a5.7 5.7 0 1 0 4.9 5.6V8.9a7.3 7.3 0 0 0 4.3 1.4V7.2a4.3 4.3 0 0 1-3.2-1.4z" />
    </svg>
  );
}

// Border and accent colour per platform. Background follows the theme (white / black).
export const PLATFORM_STYLE: Record<PlatformKey, { border: string; text: string }> = {
  tiktok: { border: "border-black dark:border-white", text: "text-black dark:text-white" },
  instagram: { border: "border-[#E1306C]", text: "text-[#E1306C]" },
  youtube: { border: "border-[#FF0000]", text: "text-[#FF0000]" },
  facebook: { border: "border-[#1877F2]", text: "text-[#1877F2]" },
};
