// pages/donasi/index.tsx
import { useEffect, useState } from "react";
import Template from "@/templates/Template";
import ReactPaginate from "react-paginate";
import DonationCard from "@/components/DonationCard";
import DonationCardSkeleton from "@/components/DonationCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ListFilter, X, HeartOff } from "lucide-react";
import Link from "next/link";

interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  CurrentAmount: number;
  Deadline: string;
  Status: string;
  Image?: string;
  Created_at: string;
}

const Donasi = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk paginasi, filter, dan sorting
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("-Created_at"); // Default: Terbaru

  const itemsPerPage = 8;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        // Bangun query string secara dinamis
        const params = new URLSearchParams({
          limit: String(itemsPerPage),
          sort: sortBy,
          page: String(currentPage + 1),
        });
        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const response = await fetch(`${API_URL}/api/v1/campaigns?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        setCampaigns(result.data.campaigns || []);
        setTotalCampaigns(result.data.total || 0);
      } catch (err: any) {
        console.error("Error fetching campaigns:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search term
    const handler = setTimeout(() => {
      fetchCampaigns();
    }, 500); // Tunda fetch 500ms setelah user berhenti mengetik

    return () => {
      clearTimeout(handler);
    };
  }, [currentPage, sortBy, searchTerm]);

  const pageCount = Math.ceil(totalCampaigns / itemsPerPage);
  
  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    window.scrollTo(0, 0); // Scroll ke atas saat ganti halaman
  };

  return (
    <Template>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              Temukan Kebaikan
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Jelajahi semua kampanye donasi dan jadilah bagian dari perubahan.
            </p>
          </div>

          {/* Control Bar: Search, Sort, Filter */}
          <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Cari nama kampanye..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <ListFilter size={20} className="text-gray-500" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="-Created_at">Terbaru</option>
                <option value="Created_at">Terlama</option>
                <option value="-CurrentAmount">Paling Banyak Didanai</option>
                <option value="Deadline">Segera Berakhir</option>
              </select>
            </div>
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + sortBy + searchTerm} // Key unik untuk re-animasi
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {Array.from({ length: itemsPerPage }).map((_, i) => <DonationCardSkeleton key={i} />)}
                </div>
              ) : error ? (
                <p className="text-center text-red-500 py-10">{error}</p>
              ) : campaigns.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                  {campaigns.map((campaign) => (
                    <DonationCard key={campaign._id} campaign={campaign} API_URL={API_URL} />
                  ))}
                </motion.div>
              ) : (
                // Empty State yang lebih baik
                <div className="text-center py-16">
                  <HeartOff className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">Oops! Tidak ada kampanye ditemukan.</h3>
                  <p className="text-gray-500 mt-2">Coba kata kunci lain atau jadilah yang pertama membuat kebaikan!</p>
                  <Link href="/campaign" className="mt-6 inline-block bg-purple-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-purple-700 transition">
                    Buat Campaign Baru
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {!loading && pageCount > 1 && (
            <div className="flex justify-center mt-12">
              <ReactPaginate
                previousLabel="Sebelumnya"
                nextLabel="Berikutnya"
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="flex items-center justify-center space-x-1"
                pageLinkClassName="px-4 py-2 border rounded-lg hover:bg-gray-200 transition-colors"
                previousLinkClassName="px-4 py-2 border rounded-lg hover:bg-gray-200 transition-colors"
                nextLinkClassName="px-4 py-2 border rounded-lg hover:bg-gray-200 transition-colors"
                activeLinkClassName="bg-purple-600 text-white border-purple-600"
                disabledLinkClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </div>
    </Template>
  );
};

export default Donasi;