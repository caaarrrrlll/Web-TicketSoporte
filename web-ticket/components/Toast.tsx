"use client";

export function Toast({
  message,
  onUndo,
}: {
  message: string;
  onUndo?: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
      <span className="text-sm">{message}</span>

      {onUndo && (
        <button
          onClick={onUndo}
          className="text-blue-400 text-sm hover:underline"
        >
          Deshacer
        </button>
      )}
    </div>
  );
}
