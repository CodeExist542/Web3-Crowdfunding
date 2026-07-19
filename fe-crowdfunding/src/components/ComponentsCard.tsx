import { useEffect, useState } from "react";
import Link from "next/link";
import DonationCard from "./DonationCard";
import { motion } from "framer-motion";

interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  Image?: string;
  CurrentAmount: number;
  Deadline: string;
  Status: string;
  Created_at: string;
}

const ComponentsCard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Setiap anak akan muncul dengan jeda 0.1 detik
      },
    },
  };
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/campaigns?limit=6&sort=-Created_at`
        );
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
        setCampaigns(data.data.campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <h3 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Donasi Terbaru
        </h3>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // Animasi akan berjalan saat di-scroll ke viewport
          viewport={{ once: true, amount: 0.2 }}
        >
          {campaigns.length > 0
            ? campaigns.map((campaign) => (
                <DonationCard
                  key={campaign._id}
                  campaign={campaign}
                  API_URL={API_URL}
                />
              ))
            : // Skeleton Loader untuk pengalaman pengguna yang lebih baik
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border rounded-2xl shadow-lg p-4 bg-white animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-2.5 bg-gray-300 rounded-full w-full mt-4"></div>
                </div>
              ))}
        </motion.div>

        {campaigns.length > 0 && (
          <div className="flex justify-center mt-12">
            <Link
              href="/donasi"
              className="bg-purple-600 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 duration-300"
            >
              Lihat Semua Donasi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentsCard;
