import { FileIcon, LinkIcon, PlusIcon, TicketIcon, VideoIcon } from '../icons.jsx';

export const KIND_META = {
  custom: { label: 'Start from scratch', bg: '#f7f7f7', icon: <PlusIcon width={28} height={28} />, defaults: {} },
  digital: {
    label: 'Digital product',
    bg: '#eef8f1',
    icon: <FileIcon width={28} height={28} />,
    defaults: { title: 'Digital download', deliveryNote: "Thanks for your purchase! Here's your download." },
  },
  'close-friends': {
    label: 'Instagram close friends access',
    bg: '#fffbea',
    icon: <LinkIcon width={28} height={28} />,
    defaults: {
      title: 'Instagram close friends access',
      question: 'Your Instagram username',
      deliveryNote: "I'll add you to my close friends list within 24 hours.",
    },
  },
  call: {
    label: '1-on-1 Zoom call',
    bg: '#fbf2f8',
    icon: <VideoIcon width={28} height={28} />,
    defaults: {
      title: '1-on-1 Zoom call',
      question: 'Your email and a few time slots that work for you',
      deliveryNote: "Thanks! I'll email you within 24 hours to schedule our call.",
    },
  },
  ticket: {
    label: 'Ticket for an event',
    bg: '#f1f3f7',
    icon: <TicketIcon width={28} height={28} />,
    defaults: { title: 'Event ticket', question: 'Name on the ticket', stock: '50', deliveryNote: 'See you there! Show this purchase at the entrance.' },
  },
};

export const TEMPLATE_ORDER = ['custom', 'digital', 'close-friends', 'call', 'ticket'];
