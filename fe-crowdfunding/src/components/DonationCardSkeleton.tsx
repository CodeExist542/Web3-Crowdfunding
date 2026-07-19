// components/DonationCardSkeleton.tsx
const DonationCardSkeleton = () => {
  return (
    <div className="border rounded-2xl shadow-lg p-4 bg-white animate-pulse">
      <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6 mb-4"></div>
      <div className="h-2.5 bg-gray-300 rounded-full w-full"></div>
      <div className="flex justify-between mt-4 border-t pt-3">
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default DonationCardSkeleton;