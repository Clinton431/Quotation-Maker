import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Plus } from "lucide-react";

export default function BillingSelector({
  contacts,
  selected,
  onSelect,
  onAddNew,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl"
      >
        <span className="truncate">
          {selected ? selected.name : "Quick fill from saved…"}
        </span>
        <ChevronDown className={`w-4 h-4 ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropRef}
            className="fixed z-[99999] bg-white border rounded-xl shadow-xl"
            style={pos}
          >
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-orange-50"
              >
                <div className="font-semibold">{c.name}</div>
                {selected?.id === c.id && (
                  <Check className="w-4 h-4 text-orange-500" />
                )}
              </button>
            ))}

            <button
              onClick={() => {
                setOpen(false);
                onAddNew();
              }}
              className="w-full px-4 py-3 text-orange-600 font-semibold"
            >
              <Plus className="inline w-4 h-4 mr-1" />
              Save New Contact
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
