// components/MainContent.tsx
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Users, DollarSign, Target } from "lucide-react";

const MainContent = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <main className="relative overflow-hidden">
      {/* Background Gradasi Bergerak */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
        <motion.div 
          className="py-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            {/* Konten Teks */}
            <div className="text-center lg:text-left">
              <motion.h1 variants={itemVariants} className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Wujudkan Ide, <br/> Ciptakan Perubahan Nyata.
              </motion.h1>
              <motion.p variants={itemVariants} className="text-gray-600 mt-4 text-lg max-w-lg mx-auto lg:mx-0">
                Platform crowdfunding berbasis smart contract yang aman, transparan, dan efisien untuk setiap mimpi dan kebaikan.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link href="/donasi" className="mt-8 inline-block bg-purple-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 duration-300">
                  Mulai Berdonasi
                </Link>
              </motion.div>
            </div>

            {/* Gambar */}
            <motion.div variants={itemVariants} className="mt-8 lg:mt-0">
              <Image
                src="/hero/hero-image.jpg"
                alt="Kolaborasi untuk kebaikan"
                width={600}
                height={400}
                priority
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Social Proof / Statistik Dinamis */}
          <motion.div 
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            variants={itemVariants}
          >
            <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <Users className="mx-auto h-8 w-8 text-purple-600 mb-2"/>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={1250} duration={3} separator="." />+
              </p>
              <p className="text-gray-600">Donatur Tergabung</p>
            </div>
            <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <DollarSign className="mx-auto h-8 w-8 text-green-600 mb-2"/>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={8900} duration={3.5} separator="." prefix="POL " />
              </p>
              <p className="text-gray-600">Dana Terkumpul</p>
            </div>
            <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <Target className="mx-auto h-8 w-8 text-blue-600 mb-2"/>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={150} duration={2.5} separator="." />+
              </p>
              <p className="text-gray-600">Campaign Sukses</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default MainContent;