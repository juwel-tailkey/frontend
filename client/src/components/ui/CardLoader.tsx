type CardLoaderProps = {
  message: string;
  subtitle?: string;
};

export function CardLoader({ message, subtitle }: CardLoaderProps) {
  return (
    <div className="card-loader">
      <div className="card-spinner"></div>
      <div className="card-spinner-text">
        <p className="card-loading-message">{message}</p>
        {subtitle && <p className="card-loading-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
