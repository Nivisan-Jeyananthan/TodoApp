import type { TodoItemType } from "../types/TodoItemType";

type FilePreviewType = {
  total: number;
  collisions: number;
  newItems: number;
  sample: any[];
};

type SetImportErrorType = (input: string | null) => void;
type setPendingImportType = (input: any[] | null) => void;
type SetPreviewType = (input: FilePreviewType | null) => void;
type setShowConfirmType = (input: boolean) => void;

export class FileUtils {
  static handleExport(todos: TodoItemType[]) {
    try {
      const dataStr = JSON.stringify(todos, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `todos-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // ignore
    }
  }

  static async handleImport(
    f: File | null,
    setImportError: SetImportErrorType,
    setPreview: SetPreviewType,
    setPendingImport: setPendingImportType,
    setShowConfirm: setShowConfirmType,
    fileRef: React.MutableRefObject<HTMLInputElement | null>,
    todos: TodoItemType[],
  ) {
    if (!f) return;

    try {
      const text = await f.text();
      const parsed = JSON.parse(text) as any[];

      // clear previous error when parse succeeds
      setImportError(null);

      // Basic validation: array of objects with Id
      if (!Array.isArray(parsed))
        throw new Error("Invalid format: expected array");

      const toImport = parsed.map((t) => ({ ...t }));
      // hold off dispatching until user confirms
      setPendingImport(toImport);
      // compute preview
      const existingIds = new Set(todos.map((t) => t.Id));
      let collisions = 0;
      for (const it of toImport)
        if (it?.Id && existingIds.has(it.Id)) collisions++;

      const total = toImport.length;
      const newItems = total - collisions;

      setPreview({
        total,
        collisions,
        newItems,
        sample: toImport.slice(0, 10),
      });
      setShowConfirm(true);
    } catch (err: any) {
      // show error in modal instead of alert
      // eslint-disable-next-line no-console
      console.error("Failed to import todos", err);
      setImportError("Failed to import todos: " + (err?.message ?? "unknown"));
      setPreview(null);
      setPendingImport(null);
      setShowConfirm(true);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }
}
