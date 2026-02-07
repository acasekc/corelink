import SeoHead from "@/components/SeoHead";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

const Index = ({ meta }) => {
  return (
    <>
      <SeoHead meta={meta} />
      <Hero />
      <Features />
    </>
  );
};

export default Index;
