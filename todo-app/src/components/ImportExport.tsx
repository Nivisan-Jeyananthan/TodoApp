import type { JSX } from "react";
import { useRef, useState, useEffect } from "react";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import { TodoItemDispatchType } from "../types/TodoItemType";
import type { TodoItemType } from "../types/TodoItemType";
import Modal from "./Modal";
import { FileUtils } from "../utils/FileUtils";
import CryptoUtils from "../utils/CryptoUtils";

export default function ImportExport(): JSX.Element {
  const todos = useTodos() ?? [];
  const dispatch = useTodosDispatch();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<any[] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [preview, setPreview] = useState<{
    total: number;
    collisions: number;
    newItems: number;
    sample: any[];
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = () => setDragActive(false);
  const onDropGlobal = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    const f = dt.files?.[0];
    if (!f) return;
    // accept JSON files
    const name = f.name || "";
    if (f.type === "application/json" || name.toLowerCase().endsWith(".json")) {
      void handleFileObject(f);
    } else {
      setImportError("Please drop a JSON file to import todos.");
      setPreview(null);
      setPendingImport(null);
      setShowConfirm(true);
    }
  };

  const onExport = () => {
    FileUtils.handleExport(todos);
  };

  const onImportClick = () => {
    fileRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    FileUtils.handleImport(
      e?.target?.files?.[0] ?? null,
      setImportError,
      setPreview,
      setPendingImport,
      setShowConfirm,
      fileRef,
      todos,
    );
  };

  // helper: handle a File object (from input or drop)
  const handleFileObject = async (f: File) => {
    FileUtils.handleImport(
      f,
      setImportError,
      setPreview,
      setPendingImport,
      setShowConfirm,
      fileRef,
      todos,
    );
  };

  // Drag & drop handlers: allow dropping a file from OS file manager
  useEffect(() => {
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDropGlobal);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDropGlobal);
    };
  }, [todos]);

  const confirmImport = () => {
    if (pendingImport && dispatch) {
      dispatch({
        type: TodoItemDispatchType.replaced,
        todos: pendingImport as TodoItemType[],
      });
    }
    setPendingImport(null);
    setShowConfirm(false);
  };

  const cancelImport = () => {
    setPendingImport(null);
    setImportError(null);
    setShowConfirm(false);
  };

  const performMerge = () => {
    if (!pendingImport) return;
    // Build map for id collisions: if imported id collides with existing, generate new id
    const existingIds = new Set(todos.map((t) => t.Id));
    const idMap = new Map<string, string>();

    // First pass: decide new IDs for imported items
    for (const it of pendingImport) {
      const origId = it?.Id ?? CryptoUtils.getRandomUUID();
      if (existingIds.has(origId)) {
        idMap.set(origId, CryptoUtils.getRandomUUID());
      } else {
        idMap.set(origId, origId);
        existingIds.add(origId); // mark as taken now to avoid collisions within imported set
      }
    }

    // Second pass: remap imported items (IDs and ParentId)
    const remapped = pendingImport.map((it) => {
      const origId = it?.Id ?? CryptoUtils.getRandomUUID();
      const newId = idMap.get(origId) ?? origId;
      const parent = (it as any)?.ParentId;
      let newParent: string | undefined = undefined;
      if (parent) {
        // if the parent was part of the imported set, remap to its new id; otherwise keep as-is
        if (idMap.has(parent)) newParent = idMap.get(parent) as string;
        else newParent = parent;
      }
      return {
        ...it,
        Id: newId,
        ParentId: newParent,
        EndsAt: it?.EndsAt
          ? it.EndsAt instanceof Date
            ? it.EndsAt
            : new Date(it.EndsAt)
          : undefined,
      } as TodoItemType;
    });

    // Combine existing todos and remapped imported todos
    const combined = [...todos, ...remapped];
    if (dispatch)
      dispatch({ type: TodoItemDispatchType.replaced, todos: combined });
    setPendingImport(null);
    setShowConfirm(false);
  };

  return (
    <>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <button className="btn primary" onClick={onExport}>
          Export
        </button>
        <button className="btn primary" onClick={onImportClick}>
          Import
        </button>
        <input
          ref={fileRef}
          style={{ display: "none" }}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
        />
      </div>

      {showConfirm && (
        <Modal title="Import preview" onClose={cancelImport}>
          {importError ? (
            <div>
              <p style={{ color: "red" }}>{importError}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <button onClick={cancelImport}>Close</button>
              </div>
            </div>
          ) : preview ? (
            <div>
              <p>
                Incoming items: <strong>{preview.total}</strong>
                {" — "}
                Collisions: <strong>{preview.collisions}</strong>
                {" — "}
                New items: <strong>{preview.newItems}</strong>
              </p>
              <div
                style={{
                  marginTop: 8,
                  maxHeight: "12rem",
                  overflow: "auto",
                  border: "1px solid rgba(255,255,255,0.04)",
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <small>Sample (first {preview.sample.length} items):</small>
                <ul style={{ marginTop: 6 }}>
                  {preview.sample.map((s, i) => (
                    <li key={i} style={{ fontSize: 12, opacity: 0.9 }}>
                      {s?.Text ?? "(no text)"}{" "}
                      <span style={{ opacity: 0.6 }}> — {s?.Id}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <button onClick={cancelImport}>Cancel</button>
                <button className="btn" onClick={performMerge}>
                  Merge
                </button>
                <button className="btn primary" onClick={confirmImport}>
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <p>Preparing import preview...</p>
          )}
        </Modal>
      )}
      {dragActive && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "none",
              background: "rgba(80,95,255,0.12)",
              padding: "1.25rem 1.5rem",
              borderRadius: 8,
              border: "1px solid rgba(80,95,255,0.16)",
            }}
          >
            <strong>Drop JSON file to import todos</strong>
          </div>
        </div>
      )}
    </>
  );
}
