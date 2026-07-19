import Template from "@/templates/Template";
import Image from "next/image";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { User, LayoutGrid, Wallet, Mail, Camera, Loader2 } from "lucide-react";
import DonationCard from "@/components/DonationCard";
import DonationCardSkeleton from "@/components/DonationCardSkeleton";
import Link from "next/link";
import { toast } from "react-hot-toast";

// Definisikan interface agar bisa digunakan kembali
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  wallet: string | null;
  Image: string;
}
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

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ Name: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin");
      return;
    }
    // Jalankan keduanya secara bersamaan untuk efisiensi
    await Promise.all([fetchUserProfile(token), fetchMyCampaigns(token)]);
  };

  const fetchUserProfile = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = response.data.data;

      localStorage.setItem("userKey", profileData.Key);
      if (profileData.WalletAddress) {
        localStorage.setItem("wallet", profileData.WalletAddress);
      }

      setUser({
        _id: profileData._id,
        name: profileData.Name,
        email: profileData.Email,
        wallet: profileData.WalletAddress || null,
        Image: profileData.Image || "/profile-placeholder.jpg",
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to fetch user profile");
      localStorage.removeItem("token");
      router.push("/auth/signin");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCampaigns = async (token: string) => {
    setIsCampaignsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/profile/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyCampaigns(response.data.data);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      setError("Gagal memuat campaign Anda.");
    } finally {
      setIsCampaignsLoading(false);
    }
  };

  const updateProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("Image", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.put(
        `${API_URL}/api/v1/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          Image: response.data.data.Image || "/profile-placeholder.jpg",
        };
      });
      toast.success("Foto profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Gagal memperbarui foto profil");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateProfileImage(e.target.files[0]);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask tidak ditemukan. Silakan instal MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      await axios.post(
        `${API_URL}/api/v1/users/connect-wallet`,
        { WalletAddress: walletAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser((prevUser) =>
        prevUser ? { ...prevUser, wallet: walletAddress } : null
      );
      localStorage.setItem("wallet", walletAddress);
      toast.success("Wallet berhasil dihubungkan!");
    } catch (error: any) {
      console.error("Backend Error:", error);
      toast.error(error.response?.data?.message || "Gagal menghubungkan wallet.");
    }
  };

  const disconnectWallet = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/api/v1/users/disconnect-wallet`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser((prevUser) => (prevUser ? { ...prevUser, wallet: null } : null));
      localStorage.removeItem("wallet");
      toast.success("Wallet berhasil diputuskan.");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Gagal memutuskan koneksi wallet.");
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.put(
        `${API_URL}/api/v1/profile`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser((prevUser) =>
        prevUser ? { ...prevUser, name: response.data.data.Name } : null
      );
      setIsEditModalOpen(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Gagal memperbarui profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = () => {
    if (user) {
      setEditFormData({ Name: user.name });
      setIsEditModalOpen(true);
    }
  };

  return (
    <Template>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 mt-12">
          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-600" />
              <p className="mt-4 text-gray-500">Memuat profil...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-20">{error}</p>
          ) : (
            user && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Profile Header */}
                <div className="p-8 flex flex-col sm:flex-row items-center gap-6 bg-gray-50/50">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() =>
                      (
                        document.getElementById("fileInput") as HTMLInputElement
                      )?.click()
                    }
                  >
                    <Image
                      src={
                        user.Image && user.Image !== "/profile-placeholder.jpg"
                          ? (user.Image.startsWith("http") ? user.Image : `${API_URL}${user.Image}`)
                          : "/profile-placeholder.jpg"
                      }
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={32} />
                    </div>
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />

                  <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px px-8 space-x-8">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold transition-colors ${
                        activeTab === "profile"
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {" "}
                      <User size={18} /> Informasi Profil{" "}
                    </button>
                    <button
                      onClick={() => setActiveTab("campaigns")}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold transition-colors ${
                        activeTab === "campaigns"
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {" "}
                      <LayoutGrid size={18} /> Campaign Saya (
                      {myCampaigns.length})
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === "profile" && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                          Detail Akun
                        </h3>
                        <button
                          onClick={openEditModal}
                          className="text-sm font-semibold text-purple-600 hover:underline"
                        >
                          Edit Profil
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border rounded-lg p-6 bg-gray-50/30">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <Mail size={20} className="text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-semibold text-gray-800">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <User size={20} className="text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Nama Lengkap
                              </p>
                              <p className="font-semibold text-gray-800">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <Wallet size={20} className="text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Wallet Address
                              </p>
                            
                              {user.wallet ? (
                                <p className="font-mono text-gray-800 break-all">
                                  {user.wallet}
                                </p>
                                
                              ) : (
                                <button
                                  onClick={connectWallet}
                                  className="text-blue-600 font-semibold hover:underline"
                                >
                                  Hubungkan Wallet
                                </button>
                              )}
                              <button
                              onClick={disconnectWallet}
                              className="text-sm font-semibold text-red-500 hover:underline"
                            >
                              Disconnect
                            </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "campaigns" && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">
                        Daftar Campaign yang Anda Buat
                      </h3>
                      {isCampaignsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <DonationCardSkeleton />
                          <DonationCardSkeleton />
                        </div>
                      ) : myCampaigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {myCampaigns.map((campaign) => (
                            <DonationCard
                              key={campaign._id}
                              campaign={campaign}
                              API_URL={API_URL}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <p className="text-gray-500">
                            Anda belum membuat campaign apapun.
                          </p>
                          <Link
                            href="/campaign"
                            className="mt-4 inline-block bg-purple-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-purple-700 transition"
                          >
                            Buat Campaign Pertama Anda
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* MODAL UNTUK EDIT PROFIL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Profil</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="Name"
                  value={editFormData.Name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, Name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-300 flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="animate-spin" size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Template>
  );
};

export default Profile;
