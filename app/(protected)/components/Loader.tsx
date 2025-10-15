interface LoaderProps {
  message?: string;
}
export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="text-center py-12">
      <div className="loader" />
      {message && <p className="text-gray-500 mt-4">{message}</p>}
    </div>
  );
};
