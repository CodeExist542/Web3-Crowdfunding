import Navbar from "@/components/Navbar";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

interface TemplateProps {
  children: ReactNode;  // Supaya bisa menerima konten dinamis
}

const Template = ({ children }: TemplateProps) => {
  return (
    <div>
      <Navbar />
      <div className="">{children}</div> {/* Tempat konten utama */}
      <Footer />
    </div>
  );
};

export default Template;
