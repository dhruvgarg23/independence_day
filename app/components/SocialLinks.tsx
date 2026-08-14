"use client";

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      {/* Twitter/X */}
      <a
        href="https://x.com/dhruvgarg_23"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter) profile"
        className="text-white/50 hover:text-white/90 transition-colors duration-200"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>



      {/* Share button */}
      <button
        aria-label="Share"
        className="text-white/50 hover:text-white/90 transition-colors duration-200 cursor-pointer"
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.share) {
            navigator.share({
              title: "Independence Day Radio",
              url: window.location.href,
            });
          }
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  );
}
