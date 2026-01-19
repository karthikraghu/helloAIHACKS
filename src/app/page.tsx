import {
  BrutalCard,
  YellowCard,
  PinkCard,
  BlueCard,
  GreenCard,
  FeatureCard,
  StatCard,
  BrutalButton,
  YellowButton,
  PinkButton,
  BlueButton,
  BlackButton,
} from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-brutal-cream p-8">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="border-2 border-black bg-brutal-yellow p-8 shadow-brutal-xl mb-8">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4">
            Neo-Brutalism
          </h1>
          <p className="text-xl md:text-2xl font-bold mb-6">
            Bold. Unapologetic. Retro-futuristic design for the modern web.
          </p>
          <div className="flex flex-wrap gap-4">
            <BlackButton iconName="rocket" size="lg">
              Get Started
            </BlackButton>
            <BrutalButton variant="white" iconName="arrowRight" iconPosition="right">
              Learn More
            </BrutalButton>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2">
          Dashboard Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            value="2,847"
            label="Total Users"
            iconName="users"
            variant="yellow"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            value="$45.2K"
            label="Revenue"
            iconName="trendingUp"
            variant="pink"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            value="156"
            label="Active Projects"
            iconName="star"
            variant="blue"
          />
          <StatCard
            value="99.9%"
            label="Uptime"
            iconName="zap"
            variant="green"
          />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            iconName="zap"
            title="Lightning Fast"
            description="Built for speed with optimized performance at every level."
            variant="yellow"
          />
          <FeatureCard
            iconName="rocket"
            title="Easy Deploy"
            description="One-click deployment to your favorite cloud platform."
            variant="pink"
          />
          <FeatureCard
            iconName="star"
            title="Top Rated"
            description="Loved by developers and designers worldwide."
            variant="blue"
          />
        </div>
      </section>

      {/* Color Variants Showcase */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2">
          Card Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <YellowCard title="Yellow Card" iconName="star">
            <p className="text-sm">Bright and attention-grabbing.</p>
          </YellowCard>
          <PinkCard title="Pink Card" iconName="star">
            <p className="text-sm">Playful and energetic.</p>
          </PinkCard>
          <BlueCard title="Blue Card" iconName="star">
            <p className="text-sm">Cool and refreshing.</p>
          </BlueCard>
          <GreenCard title="Green Card" iconName="star">
            <p className="text-sm">Fresh and natural.</p>
          </GreenCard>
          <BrutalCard variant="orange" title="Orange Card" iconName="star">
            <p className="text-sm">Warm and inviting.</p>
          </BrutalCard>
          <BrutalCard variant="purple" title="Purple Card" iconName="star">
            <p className="text-sm">Creative and unique.</p>
          </BrutalCard>
        </div>
      </section>

      {/* Button Showcase */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2">
          Button Variants
        </h2>
        <div className="flex flex-wrap gap-4 p-6 border-2 border-black bg-white shadow-brutal">
          <YellowButton iconName="zap">Yellow</YellowButton>
          <PinkButton iconName="star">Pink</PinkButton>
          <BlueButton iconName="rocket">Blue</BlueButton>
          <BrutalButton variant="green">Green</BrutalButton>
          <BrutalButton variant="orange">Orange</BrutalButton>
          <BrutalButton variant="purple">Purple</BrutalButton>
          <BlackButton>Black</BlackButton>
          <BrutalButton variant="white">White</BrutalButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto text-center py-8 border-t-4 border-black">
        <p className="font-bold uppercase">
          Built for Hackathons • Neo-Brutalism Design System
        </p>
      </footer>
    </main>
  );
}
