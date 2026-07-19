// components/DonationCard.tsx
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Target as TargetIcon } from "lucide-react"; // Ikon baru

interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  CurrentAmount: number;
  Deadline: string;
  Status: string;
  Image?: string;
}

interface DonationCardProps {
  campaign: Campaign;
  API_URL: string;
}

const DonationCard: React.FC<DonationCardProps> = ({ campaign, API_URL }) => {
  const progress = Math.min(
    (campaign.CurrentAmount / campaign.TargetAmount) * 100,
    100
  );
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "withdrawn":
        return "bg-gray-700 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  } as const;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link
        href={`/donasi/${campaign._id}`}
        className="block h-full p-4 border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col group"
      >
        <div className="w-full h-48 relative overflow-hidden rounded-xl mb-4">
          {campaign.Image ? (
            <Image
              src={campaign.Image.startsWith("http") ? campaign.Image : `${API_URL}${campaign.Image}`}
              alt={campaign.Title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="rounded-xl transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-medium rounded-xl">
              No Image
            </div>
          )}
          <div
            className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-md ${getStatusStyles(
              campaign.Status
            )}`}
          >
            {campaign.Status.charAt(0).toUpperCase() + campaign.Status.slice(1)}
          </div>
        </div>

        <h4 className="text-lg font-bold text-gray-800 truncate mb-1">
          {campaign.Title}
        </h4>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2 flex-grow">
          {campaign.Description}
        </p>

        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <p className="font-semibold text-gray-800">Terkumpul</p>
            <p className="font-bold text-purple-600">{progress.toFixed(0)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm mt-4 border-t pt-3">
          <p className="flex items-center gap-1 text-gray-500 text-xs">
            <TargetIcon size={14} />
            <span className="font-semibold text-gray-800">
              {campaign.TargetAmount} POL
            </span>
          </p>
          <p className="flex items-center gap-1 text-gray-500 text-xs">
            <Calendar size={14} />
            {new Date(campaign.Deadline).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default DonationCard;
