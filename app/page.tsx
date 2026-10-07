import HeroSection from '@/components/HeroSection';
import HuongDanSoBo from '@/components/HuongDanSoBo';
import KhamPhaVanHoa from '@/components/KhamPhaVanHoa';
import GoiYHomNay from '@/components/GoiYHomNay';

export default function TrangChu() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <HeroSection />
      <GoiYHomNay />
      <KhamPhaVanHoa />
      <HuongDanSoBo />
    </main>
  );
}