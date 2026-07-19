import ComponentsCard from "@/components/ComponentsCard";
import Footer from "@/components/Footer";
import MainContent from "@/components/MainContent";
import Navbar from "@/components/Navbar";
import Template from "@/templates/Template";

const Home = () => {
  return (
    <div>
      <Template>
        <MainContent />
        <ComponentsCard />
      </Template>
    </div>
  );
};

export default Home;
