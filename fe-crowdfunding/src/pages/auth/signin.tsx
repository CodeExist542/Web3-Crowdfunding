import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthContent";
import { useRouter } from "next/router";
import Template from "@/templates/Template";
import { Mail, Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ Email: "", Password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal. Periksa kembali email dan password Anda.");
      }
      toast.success("Login berhasil!");
      login(data);
      router.push("/profile"); // Redirect ke profil setelah login

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Template>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2">
          
          {/* Kolom Kiri: Gambar & Branding */}
          <div className="hidden md:block relative">
            <Image 
              src="/hero/hero-image.jpg" // Ganti dengan gambar yang relevan
              alt="Crowdfunding Event"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute inset-0 bg-purple-800 bg-opacity-60 flex flex-col justify-end p-8 text-white">
              <h2 className="text-3xl font-bold">Selamat Datang Kembali</h2>
              <p className="mt-2 text-purple-200">Lanjutkan perjalanan Anda dalam mewujudkan ide dan mendukung perubahan.</p>
            </div>
          </div>
          
          {/* Kolom Kanan: Form Login */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">Login</h2>
            <p className="text-gray-500 text-center mb-8">Masukkan detail akun Anda.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="••••••••" required
                  />
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm">
                Belum punya akun?{" "}
                <Link href="/auth/register" className="font-semibold text-purple-600 hover:underline">
                  Daftar di sini
                </Link>
              </p>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Template>
  );
};

export default SignIn;