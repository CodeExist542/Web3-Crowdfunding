// index.tsx (File Utama yang Diubah)
import Template from "@/templates/Template";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Toaster, toast } from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiUploadCloud,
} from "react-icons/fi";

// Tipe data untuk form
interface FormDataState {
  title: string;
  description: string;
  nominal: number;
  date: string;
  file: File | null;
  filePreview: string | null;
}

const Campaign = () => {
  const [step, setStep] = useState(0); // 0: Connect Wallet, 1: Details, 2: Target, 3: Review
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    description: "",
    nominal: 10,
    date: "", // Default ke tanggal di masa depan
    file: null,
    filePreview: null,
  });
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ownerID, setOwnerID] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // --- LOGIKA WALLET (Sama seperti sebelumnya, tidak perlu diubah) ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Anda harus login terlebih dahulu!");
      router.push("/auth/signin");
      return;
    }

    const storedWallet = localStorage.getItem("wallet");
    const storedOwnerID = localStorage.getItem("userKey");
    if (storedWallet) {
      setWalletConnected(true);
      setWalletAddress(storedWallet);
      setStep(1); // Jika wallet sudah ada, langsung ke step 1
    }
    if (storedOwnerID) setOwnerID(storedOwnerID);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [router]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletConnected(false);
      setWalletAddress(null);
      localStorage.removeItem("wallet");
      setStep(0); // Kembali ke step awal jika disconnect
      toast.error("Wallet terputus. Silakan hubungkan kembali.");
    } else {
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      localStorage.setItem("wallet", accounts[0]);
      setStep(1); // Maju ke step 1 setelah connect
      toast.success("Wallet berhasil terhubung!");
    }
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    localStorage.removeItem("wallet");
    setStep(0);
    toast.error("Wallet terputus. Silakan hubungkan kembali.");
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask belum terinstal!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      handleAccountsChanged(accounts);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      toast.error("Gagal menghubungkan wallet.");
    }
  };
  // --- END LOGIKA WALLET ---

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    if (droppedFile) {
      setFormData((prev) => ({
        ...prev,
        file: droppedFile,
        filePreview: URL.createObjectURL(droppedFile),
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    multiple: false,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const validateStep1 = () => {
    if (!formData.title) {
      toast.error("Judul campaign harus diisi!");
      return false;
    }
    if (!formData.description) {
      toast.error("Deskripsi harus diisi!");
      return false;
    }
    if (!formData.file) {
      toast.error("Gambar campaign harus diunggah!");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.nominal || formData.nominal <= 0) {
      toast.error("Nominal target harus lebih dari 0!");
      return false;
    }
    if (!formData.date) {
      toast.error("Tenggat waktu harus diisi!");
      return false;
    }
    if (new Date(formData.date) <= new Date()) {
      toast.error("Tenggat waktu harus di masa depan!");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!ownerID) {
      toast.error("User tidak memiliki OwnerID. Silakan login ulang.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Membuat campaign...");

    const data = new FormData();
    data.append("Title", formData.title);
    data.append("TargetAmount", formData.nominal.toString());
    data.append("Deadline", new Date(formData.date).toISOString());
    data.append("Description", formData.description);
    data.append("Status", "Active");
    data.append("OwnerID", ownerID);
    if (formData.file) data.append("Image", formData.file);

    // Bagian dalam fungsi handleSubmit

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Anda belum login!");

      const response = await fetch(`${API_URL}/api/v1/campaigns`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: data,
      });
      if (!response.ok) throw new Error("Gagal membuat campaign!");

      toast.success("Campaign berhasil dibuat! Mengalihkan...", {
        id: toastId,
      });

      // Tambahkan sedikit jeda agar user bisa membaca notifikasi, lalu redirect
      setTimeout(() => {
        router.push("/donasi"); // <-- PINDAHKAN PENGGUNA KE HALAMAN /donasi
      }, 1500); // Jeda 1.5 detik
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan!";
      toast.error(message, { id: toastId });
    } finally {
      // Kita tidak perlu setLoading(false) di sini jika redirect berhasil
      // Tapi tetap biarkan jika ada kemungkinan redirect gagal
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Connect Wallet Step
        return (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Satu Langkah Lagi...
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Untuk membuat campaign, Anda perlu menghubungkan wallet digital
              Anda terlebih dahulu. Ini memastikan keamanan dan transparansi.
            </p>
            <button
              onClick={handleConnectWallet}
              className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 duration-300"
            >
              Hubungkan Wallet MetaMask
            </button>
          </div>
        );

      case 1: // Details Step
        return (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Langkah 1: Ceritakan Campaign Anda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-gray-800 font-semibold mb-2"
                  >
                    Judul Campaign
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Bantuan untuk Sekolah di Pelosok"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-gray-800 font-semibold mb-2"
                  >
                    Deskripsi Lengkap
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    placeholder="Jelaskan tujuan, latar belakang, dan rincian penggunaan dana..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Gambar Utama Campaign
                </label>
                <div
                  {...getRootProps()}
                  className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {formData.filePreview ? (
                    <Image
                      src={formData.filePreview}
                      alt="Preview"
                      width={400}
                      height={200}
                      className="rounded-lg object-cover w-full h-auto"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <FiUploadCloud className="w-12 h-12 mb-4" />
                      <p>
                        {isDragActive
                          ? "Jatuhkan gambar di sini..."
                          : "Seret & jatuhkan gambar, atau klik"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG, JPEG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Target & Date Step
        return (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Langkah 2: Tentukan Target
            </h3>
            <div className="max-w-md mx-auto flex flex-col gap-6">
              <div>
                <label
                  htmlFor="nominal"
                  className="block text-gray-800 font-semibold mb-2"
                >
                  Target Dana (POL)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Image
                      src="/polygon-crypto.png"
                      alt="POL"
                      width={28}
                      height={28}
                    />
                  </span>
                  <input
                    type="number"
                    id="nominal"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                    value={formData.nominal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nominal: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-gray-800 font-semibold mb-2"
                >
                  Tenggat Waktu
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3: // Review Step
        return (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Langkah 3: Tinjau & Konfirmasi
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
              {formData.filePreview && (
                <Image
                  src={formData.filePreview}
                  alt="Preview"
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full h-48 mb-4"
                />
              )}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-600">Judul</h4>
                <p className="text-gray-800 text-right">{formData.title}</p>
              </div>
              <hr />
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-600">Target</h4>
                <p className="text-gray-800 font-mono font-bold text-right">
                  {formData.nominal} POL
                </p>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-600">Berakhir pada</h4>
                <p className="text-gray-800 text-right">
                  {new Date(formData.date).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <hr />
              <div>
                <h4 className="font-semibold text-gray-600 mb-2">Deskripsi</h4>
                <p className="text-gray-700 text-sm bg-white p-3 rounded-md border">
                  {formData.description}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = ["Detail", "Target", "Tinjau"];

  return (
    <Template>
      <div className="min-h-screen bg-gray-100 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <h2 className="text-4xl font-extrabold text-center mb-2 text-gray-900">
                Buat Campaign Baru
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Wujudkan ide Anda melalui pendanaan yang transparan dan aman.
              </p>

              {/* Stepper UI */}
              {step > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-center">
                    {steps.map((name, index) => (
                      <div key={name} className="flex items-center">
                        <div
                          className={`flex flex-col items-center ${
                            step >= index + 1
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                              step > index + 1
                                ? "bg-blue-600 text-white border-blue-600"
                                : step === index + 1
                                ? "border-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {step > index + 1 ? <FiCheck /> : index + 1}
                          </div>
                          <p className="text-sm mt-2">{name}</p>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`flex-auto border-t-2 transition-colors duration-500 mx-4 ${
                              step > index + 1
                                ? "border-blue-600"
                                : "border-gray-300"
                            }`}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Current Step Content */}
              <div className="mt-8">{renderStep()}</div>
            </div>

            {/* Navigation Buttons */}
            {step > 0 && (
              <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  <FiArrowLeft />
                  <span>Kembali</span>
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => {
                      if (step === 1 && validateStep1()) nextStep();
                      if (step === 2 && validateStep2()) nextStep();
                    }}
                    className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
                  >
                    Lanjutkan
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 text-white font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-300 flex items-center gap-2"
                  >
                    {loading && (
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                    )}
                    <span>Buat Campaign</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Template>
  );
};

export default Campaign;
