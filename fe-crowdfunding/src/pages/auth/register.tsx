import Template from "@/templates/Template";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/router'; // Import useRouter
import { User, Mail, Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

const Register = () => {
  const router = useRouter(); // Inisialisasi router
  const [formData, setFormData] = useState({
    Name: "", // ✅ Disesuaikan dengan API
    Email: "",
    Password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Password.length < 6) {
      toast.error("Password harus memiliki minimal 6 karakter.");
      return;
    }
    if (formData.Password !== formData.confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
        { Name: formData.Name, Email: formData.Email, Password: formData.Password }
      );

      if (response.status === 201) {
        toast.success("Registrasi berhasil! Anda akan dialihkan ke halaman login...");
        setTimeout(() => {
          router.push("/auth/signin"); // ✅ Redirect menggunakan router.push
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Template>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2 mt-[70px]">
          
          {/* Kolom Kanan: Form Register */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">Buat Akun Baru</h2>
            <p className="text-gray-500 text-center mb-8">Mulailah perjalanan kebaikan Anda hari ini.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text" name="Name" value={formData.Name} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nama Anda" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email" name="Email" value={formData.Email} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="you@example.com" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password" name="Password" value={formData.Password} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Minimal 6 karakter" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ulangi password" required
                  />
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm">
                Sudah punya akun?{" "}
                <Link href="/auth/signin" className="font-semibold text-purple-600 hover:underline">
                  Login di sini
                </Link>
              </p>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Register"}
              </button>
            </form>
          </div>
          
          {/* Kolom Kiri: Gambar & Branding (dibalik posisinya) */}
          <div className="hidden md:block relative">
            <Image 
              src="/hero/hero-image.jpg" // Ganti dengan gambar yang relevan
              alt="Community Support"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute inset-0 bg-purple-800 bg-opacity-60 flex flex-col justify-end p-8 text-white">
              <h2 className="text-3xl font-bold">Bergabung dengan Komunitas</h2>
              <p className="mt-2 text-purple-200">Daftar sekarang untuk memulai campaign pertama Anda atau dukung ide-ide brilian lainnya.</p>
            </div>
          </div>

        </div>
      </div>
    </Template>
  );
};

export default Register;