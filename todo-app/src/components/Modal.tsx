import type { JSX } from "react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
}

export default function Modal({ title, children, actions, onClose }: ModalProps): JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title ? <h3>{title}</h3> : null}
        <div>{children}</div>
        {actions ? <div style={{ marginTop: 12 }}>{actions}</div> : null}
      </div>
    </div>
  );
}
