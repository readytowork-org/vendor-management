interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" hidden={!message} role="status" aria-live="polite">
      {message}
    </div>
  );
}
