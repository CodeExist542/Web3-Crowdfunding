import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/Constants/SmartContract";
import {
  User,
  Calendar,
  Target as TargetIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  CurrentAmount: number;
  Key: Number;
  Deadline: string;
  Status: string;
  Image?: string;
  Owner: {
    Name: string;
    Email: string;
    Key: Number;
    WalletAddress?: string | null;
  };
}

const DonationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [donation, setDonation] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;

    const fetchDonation = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/campaigns/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDonation(data.data);
      } catch (err: any) {
        console.error("Error fetching donation details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id, API_URL]);

  const handleDonate = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask belum terinstal!");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Masukkan nominal donasi yang valid!");
      return;
    }

    const token = localStorage.getItem("token");
    const userKey = localStorage.getItem("userKey");

    if (!token || !userKey) {
      toast.error("Anda harus login terlebih dahulu!");
      setTimeout(() => router.push("/auth/signin"), 2000);
      return;
    }

    const toastId = toast.loading("Memproses donasi...");

    try {
      setDonating(true);

      const donationData = {
        CampaignID: donation?.Key,
        DonorID: Number(userKey),
        Amount: amount,
      };

      const response = await fetch(`${API_URL}/api/v1/donations`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        throw new Error(
          `Gagal menyimpan donasi ke backend: ${response.status}`
        );
      }

      toast.success("Donasi berhasil! Terima kasih atas dukungan Anda.", { id: toastId });
      
      // Refresh halaman untuk memperbarui data donasi
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error) {
      console.error("Error saat donasi:", error);
      toast.error("Gagal melakukan donasi. Coba lagi.", { id: toastId });
    } finally {
      setDonating(false);
    }
  };

  const handleWithdraw = async () => {
    if (!donation || !donation.Key) {
      toast.error("Donasi tidak valid untuk ditarik.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Anda harus login terlebih dahulu!");
      setTimeout(() => router.push("/auth/signin"), 2000);
      return;
    }

    const toastId = toast.loading("Memproses penarikan dana...");

    try {
      setWithdrawing(true);
      const response = await fetch(`${API_URL}/api/v1/donations/withdraw`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ CampaignID: donation.Key }),
      });

      if (!response.ok) {
        throw new Error(`Gagal menarik donasi: ${response.status}`);
      }
      toast.success("Donasi berhasil ditarik.", { id: toastId });
      
      // Refresh halaman untuk memperbarui status
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error) {
      console.error("Error saat menarik donasi:", error);
      toast.error("Gagal menarik donasi. Coba lagi.", { id: toastId });
    } finally {
      setWithdrawing(false);
    }
  };

  const handleRefund = async () => {
    if (!donation || !donation.Key) {
      toast.error("Donasi tidak valid untuk di-refund.");
      return;
    }

    const token = localStorage.getItem("token");
    const userKey = localStorage.getItem("userKey");
    
    if (!token || !userKey) {
      toast.error("Anda harus login terlebih dahulu!");
      setTimeout(() => router.push("/auth/signin"), 2000);
      return;
    }

    const toastId = toast.loading("Memproses pengembalian dana...");

    try {
      setRefunding(true);
      const response = await fetch(`${API_URL}/api/v1/donations/refund`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ CampaignID: donation.Key, DonorID: userKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Gagal memproses refund: ${response.status}`);
      }
      toast.success("Dana berhasil dikembalikan ke wallet Anda.", { id: toastId });
      
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error saat refund donasi:", error);
      toast.error(error.message || "Gagal memproses refund. Coba lagi.", { id: toastId });
    } finally {
      setRefunding(false);
    }
  };

  const handleCancelCampaign = async () => {
    if (!donation || !donation.Key) return;

    if (!confirm("Apakah Anda yakin ingin membatalkan campaign ini? Aksi ini tidak dapat dibatalkan.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const toastId = toast.loading("Membatalkan campaign...");

    try {
      setCancelling(true);
      const response = await fetch(`${API_URL}/api/v1/campaigns/cancel`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ CampaignID: donation.Key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Gagal membatalkan campaign: ${response.status}`);
      }
      
      toast.success("Campaign berhasil dibatalkan.", { id: toastId });
      
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error saat membatalkan campaign:", error);
      toast.error(error.message || "Gagal membatalkan campaign. Coba lagi.", { id: toastId });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin h-12 w-12 text-purple-600"/></div>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!donation) return <p className="text-center text-3xl mt-10 font-bold">Kampanye tidak ditemukan.</p>;

  const progress = Math.min(
    (donation.CurrentAmount / donation.TargetAmount) * 100,
    100
  );
  const remainingDays = Math.max(
    Math.ceil(
      (new Date(donation.Deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    0
  );

  return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Judul dan Subjudul Halaman */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {donation.Title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kolom Kiri: Gambar dan Detail Utama */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gambar Banner */}
              <div className="relative w-full h-96 overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={donation.Image ? (donation.Image.startsWith("http") ? donation.Image : `${API_URL}${donation.Image}`) : "/placeholder.jpg"}
                  alt={donation.Title}
                  fill
                  style={{objectFit: 'cover'}}
                  priority
                />
              </div>

              {/* Box Info Kreator */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Dibuat oleh</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{donation.Owner.Name}</p>
                    <p className="text-sm text-gray-500">{donation.Owner.Email}</p>
                  </div>
                </div>
              </div>

              {/* Deskripsi Campaign */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Deskripsi Lengkap</h3>
                 <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                   {donation.Description}
                 </p>
              </div>
            </div>

            {/* Kolom Kanan: Status Donasi & Form */}
            <div className="lg:col-span-1 space-y-8">
              {/* Box Status Donasi */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center text-sm mb-1">
                  <p className="font-semibold text-gray-800">Terkumpul</p>
                  <p className="font-bold text-purple-600">{progress.toFixed(0)}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {donation.CurrentAmount} <span className="text-sm font-medium text-gray-500">POL</span>
                </p>
                <p className="text-xs text-gray-500">dari target {donation.TargetAmount} POL</p>
                
                <div className="flex justify-between mt-4 border-t pt-4">
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-800">{remainingDays}</p>
                    <p className="text-xs text-gray-500">Hari Tersisa</p>
                  </div>
                   <div className="text-center">
                    <p className="font-bold text-lg text-gray-800">120</p>
                    <p className="text-xs text-gray-500">Donatur</p>
                  </div>
                   <div className={`text-center font-semibold px-3 py-1 rounded-full text-xs self-center ${donation.Status === "Active" ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {donation.Status === "Active" ? "Aktif" : "Selesai"}
                  </div>
                </div>
              </div>

              {/* Form Donasi */}
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Beri Dukungan</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Donasi (POL)</label>
                  <input
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: 10"
                  />
                </div>
                <button
                  className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-purple-700 transition disabled:opacity-50 flex justify-center items-center"
                  disabled={donating || !amount || Number(amount) <= 0 || donation.Status !== "Active"}
                  onClick={handleDonate}
                >
                  {donating ? <Loader2 className="animate-spin" /> : "Kirim Donasi"}
                </button>
                {donation.Status === "Completed" && donation.Owner.WalletAddress && (
                  <button
                    onClick={handleWithdraw}
                    className="w-full mt-4 bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-800 transition disabled:opacity-50 flex justify-center items-center"
                    disabled={withdrawing}
                  >
                    {withdrawing ? <Loader2 className="animate-spin" /> : "Tarik Dana"}
                  </button>
                )}
                
                {/* Cancel Campaign Button */}
                {donation.Status === "Active" && typeof window !== "undefined" && localStorage.getItem("userKey") === donation.Owner.Key.toString() && (
                  <button
                    onClick={handleCancelCampaign}
                    className="w-full mt-4 bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-700 transition disabled:opacity-50 flex justify-center items-center"
                    disabled={cancelling}
                  >
                    {cancelling ? <Loader2 className="animate-spin" /> : "Batalkan Campaign"}
                  </button>
                )}

                {(donation.Status === "Cancelled" || (remainingDays <= 0 && progress < 100)) && (
                  <button
                    onClick={handleRefund}
                    className="w-full mt-4 bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-red-700 transition disabled:opacity-50 flex justify-center items-center"
                    disabled={refunding}
                  >
                    {refunding ? <Loader2 className="animate-spin" /> : "Tarik Kembali Dana (Refund)"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DonationDetail;
