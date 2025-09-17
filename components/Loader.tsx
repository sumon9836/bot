'use client';

interface LoaderProps {
  message?: string;
}

export function Loader({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export function InlineSpinner() {
  return <i className="fas fa-spinner fa-spin"></i>;
}