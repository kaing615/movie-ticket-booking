import { useSelector } from "react-redux";

const Loading = () => {
  const { isLoading } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-1000">
      <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">Loading</p>
            <div className="flex space-x-1 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
