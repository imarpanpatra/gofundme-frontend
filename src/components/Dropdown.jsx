import { useEffect, useRef, useState } from 'react';

export default function Dropdown({ trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`dropdown ${className}`} ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <ul className={`dropdown-menu dropdown-${align}`} role="menu" onClick={() => setOpen(false)}>
          {children}
        </ul>
      )}
    </div>
  );
}

export function DropdownItem({ icon, children, onClick, href, as: As }) {
  const content = (
    <>
      {icon && <span className="dropdown-icon">{icon}</span>}
      <span>{children}</span>
    </>
  );
  return (
    <li role="none">
      {As ? (
        <As className="dropdown-item" role="menuitem" {...(href ? { to: href } : {})}>
          {content}
        </As>
      ) : (
        <button type="button" className="dropdown-item" role="menuitem" onClick={onClick}>
          {content}
        </button>
      )}
    </li>
  );
}
