const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const make = (children) => (props) => (
  <svg {...base} {...props}>
    {children}
  </svg>
);

export const ShareIcon = make(
  <>
    <path d="M12 3v12" />
    <path d="M7.5 7.5 12 3l4.5 4.5" />
    <path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" />
  </>
);

export const PlusIcon = make(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const MenuIcon = make(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);

export const MoreIcon = make(
  <>
    <circle cx="5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="19" cy="12" r="1.2" fill="currentColor" />
  </>
);

export const VideoIcon = make(
  <>
    <rect x="3" y="6.5" width="12.5" height="11" rx="2.5" />
    <path d="m15.5 10.5 5-3v9l-5-3" />
    <circle cx="19.5" cy="4.5" r="2.5" fill="#ff5c5c" stroke="none" />
  </>
);

export const InfoIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="7.8" r="0.6" fill="currentColor" />
  </>
);

export const GlobeIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18" />
    <path d="M12 3a14 14 0 0 0 0 18" />
  </>
);

export const HeartIcon = make(
  <path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.8 4 7.3 4c2 0 3.5 1.1 4.7 2.7C13.2 5.1 14.7 4 16.7 4c3.5 0 5.7 3.4 4.5 6.7C19.5 15.4 12 20 12 20Z" />
);

export const LockIcon = make(
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </>
);

export const CloseIcon = make(
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </>
);

export const CameraIcon = make(
  <>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.5" />
  </>
);

export const LinkIcon = make(
  <>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </>
);

export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);

export const UsersIcon = make(
  <>
    <circle cx="6" cy="8" r="2.2" />
    <circle cx="12" cy="7" r="2.6" />
    <circle cx="18" cy="8" r="2.2" />
    <path d="M2.5 17c0-2.2 1.6-3.8 3.5-3.8 1 0 1.9.4 2.5 1" />
    <path d="M7.5 18c0-2.8 2-4.8 4.5-4.8s4.5 2 4.5 4.8" />
    <path d="M21.5 17c0-2.2-1.6-3.8-3.5-3.8-1 0-1.9.4-2.5 1" />
  </>
);

export const ChatIcon = make(<path d="M5 18.5 3.5 21l.8-4A8 8 0 1 1 8 19.6L5 18.5Z" />);

export const EyeIcon = make(
  <>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const EyeOffIcon = make(
  <>
    <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.8 3.7" />
    <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.9 0 3.6-.6 5-1.5" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m3 3 18 18" />
  </>
);

export const SunIcon = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </>
);

export const MoonIcon = make(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />);

export const HomeIcon = make(<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" />);

export const PageIcon = make(
  <>
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
    <path d="M3.5 9h17" />
    <path d="M9 9v11" />
  </>
);

export const ExternalIcon = make(
  <>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M19 14v4.5A1.5 1.5 0 0 1 17.5 20h-12A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5H10" />
  </>
);

export const BagIcon = make(
  <>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </>
);

export const PenIcon = make(<path d="M15.5 4.5 19.5 8.5 8 20H4v-4L15.5 4.5Z" />);

export const GearIcon = make(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.4l2 1.2M17.8 15.4l2 1.2M4.2 16.6l2-1.2M17.8 8.6l2-1.2" />
    <circle cx="12" cy="12" r="7" />
  </>
);

export const MailIcon = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </>
);

export const ImageIcon = make(
  <>
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="m20.5 15-4.5-4.5L6 20" />
  </>
);

export const QuoteIcon = make(
  <>
    <path d="M10 7H6.5A1.5 1.5 0 0 0 5 8.5V12h4v5H5" />
    <path d="M19 7h-3.5A1.5 1.5 0 0 0 14 8.5V12h4v5h-4" />
  </>
);

export const ListIcon = make(
  <>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r=".8" fill="currentColor" />
    <circle cx="4.5" cy="12" r=".8" fill="currentColor" />
    <circle cx="4.5" cy="18" r=".8" fill="currentColor" />
  </>
);

export const CodeIcon = make(
  <>
    <path d="m8 7-5 5 5 5" />
    <path d="m16 7 5 5-5 5" />
    <path d="m13.5 4-3 16" />
  </>
);

export const EmbedIcon = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M7 15h10" />
  </>
);

export const TicketIcon = make(
  <>
    <path d="M3 8.5V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-2a2.5 2.5 0 0 0 0-5Z" />
    <path d="M8 9h8v6H8z" />
  </>
);

export const BoxIcon = make(
  <>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </>
);

export const FileIcon = make(
  <>
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M10 9h2M10 12h2M10 15h2" />
  </>
);

export const StarIcon = make(<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />);

export const TrashIcon = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4.5h6V7" />
    <path d="M6.5 7 7.5 20h9l1-13" />
  </>
);

export const ArrowLeftIcon = make(
  <>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </>
);

export const ArrowRightIcon = make(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>
);

export const CalendarIcon = make(
  <>
    <rect x="4" y="5" width="16" height="15" rx="2.5" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </>
);

export const CoinIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6.5V8M12 16v1.5" />
  </>
);

export const TrophyIcon = make(
  <>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H5a3 3 0 0 0 3 4" />
    <path d="M16 6h3a3 3 0 0 1-3 4" />
    <path d="M12 13v4" />
    <path d="M8.5 20h7" />
    <path d="M10 17h4v3h-4z" />
  </>
);

export const ChevronDownIcon = make(<path d="m6 9 6 6 6-6" />);
