// components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
// Pastikan Anda sudah install react-icons: npm install react-icons
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Kolom Logo dan Deskripsi */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Bayfund Logo" width={32} height={32} />
                <span className="font-bold text-xl">bayfund</span>
              </Link>
              <p className="text-gray-400 text-sm">
                Platform crowdfunding transparan untuk mewujudkan ide dan membantu sesama.
              </p>
            </div>

            {/* Kolom Link Navigasi */}
            <div>
              <h4 className="font-bold text-gray-200 mb-4">Jelajahi</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/donasi" className="text-gray-400 hover:text-white">Donasi</Link></li>
                <li><Link href="/campaign" className="text-gray-400 hover:text-white">Buat Campaign</Link></li>
                <li><Link href="/#cara-kerja" className="text-gray-400 hover:text-white">Cara Kerja</Link></li>
              </ul>
            </div>

            {/* Kolom Link Bantuan */}
            <div>
              <h4 className="font-bold text-gray-200 mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Hubungi Kami</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Syarat & Ketentuan</Link></li>
              </ul>
            </div>

            {/* Kolom Media Sosial */}
            <div>
              <h4 className="font-bold text-gray-200 mb-4">Ikuti Kami</h4>
              <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white text-2xl"><FaFacebook /></a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white text-2xl"><FaTwitter /></a>
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white text-2xl"><FaInstagram /></a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Bayfund. Semua Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;