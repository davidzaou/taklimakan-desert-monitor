import { useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function SlidePanel({ open, onClose, children }) {
  const panelRef = useRef(null);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current && panelRef.current) {
      panelRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <div
      ref={panelRef}
      className={`slide-panel ${open ? "open" : ""}`}
      role="region"
      aria-label="Feature details panel"
      tabIndex={-1}
    >
      <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
        <FiX size={20} />
      </button>
      <div className="panel-content">{children}</div>
    </div>
  );
}
