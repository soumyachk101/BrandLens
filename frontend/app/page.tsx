import { BarChart3, Globe, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';

export default function Home() {
 return (
 <div className="flex min-h-screen flex-col">
 {/* Header */}
 <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
 <div className="container flex h-16 items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles className="h-6 w-6 text-primary" />
 <span className="text-xl font-bold">BrandLens</span>
 </div>
 <nav className="hidden md:flex gap-6">
 <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
 <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
 <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
 </nav>
 <div className="flex gap-2">
 <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent">Sign In</button>
 <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Get Started</button>
 </div>
 </div>
 </header>

 {/* Hero Section */}
 <section className="container py-24 md:py-32">
 <div className="flex flex-col items-center text-center space-y-4">
 <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
 🚀 AI-powered brand visibility tracking
 </div>
 <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
 See How AI <span className="text-primary">Mentions Your Brand</span>
 </h1>
 <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
 Track your brand visibility across ChatGPT, Perplexity, Claude, and Google AI Overviews. Know what AI says about you before your customers do.
 </p>
 <div className="flex flex-col sm:flex-row gap-4">
 <button className="px-8 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
 Start Free Trial
 </button>
 <button className="px-8 py-3 text-sm font-medium border rounded-md hover:bg-accent">
 Learn More
 </button>
 </div>
 </div>
 </section>

 {/* Features Section */}
 <section id="features" className="container py-24 bg-muted/50">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold mb-4">Monitor Your Brand Across All AI Platforms</h2>
 <p className="text-muted-foreground max-w-2xl mx-auto">
 Get insights on how AI models talk about your brand, compare with competitors, and stay ahead in the AI-driven search era.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <FeatureCard
 icon={<Globe className="h-8 w-8" />}
 title="Multi-Platform Tracking"
 description="Monitor ChatGPT, Perplexity, Claude, and Google AI Overviews from one dashboard."
 />
 <FeatureCard
 icon={<TrendingUp className="h-8 w-8" />}
 title="Competitor Analysis"
 description="See how you stack up against competitors in AI responses and visibility scores."
 />
 <FeatureCard
 icon={<BarChart3 className="h-8 w-8" />}
 title="Weekly Reports"
 description="Get white-labeled PDF reports delivered to your inbox every week."
 />
 <FeatureCard
 icon={<Sparkles className="h-8 w-8" />}
 title="Sentiment Analysis"
 description="Understand the sentiment of AI mentions - positive, neutral, or negative."
 />
 <FeatureCard
 icon={<Zap className="h-8 w-8" />}
 title="Real-time Alerts"
 description="Get notified when your brand is mentioned or competitor visibility changes."
 />
 <FeatureCard
 icon={<Shield className="h-8 w-8" />}
 title="White-Label"
 description="Deliver professional reports under your agency's brand to clients."
 />
 </div>
 </section>

 {/* Pricing Section */}
 <section id="pricing" className="container py-24">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
 <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
 <PricingCard
 name="Starter"
 price="$29"
 period="/month"
 description="For small agencies"
 features={['3 brands', 'Weekly reports', 'Basic analytics', 'Email support']}
 />
 <PricingCard
 name="Growth"
 price="$79"
 period="/month"
 description="For growing agencies"
 features={['10 brands', 'Daily scans', 'Advanced analytics', 'Priority support', 'White-label reports']}
 highlighted
 />
 <PricingCard
 name="Agency"
 price="$149"
 period="/month"
 description="For large agencies"
 features={['25 brands', 'Real-time tracking', 'Custom integrations', 'Dedicated support', 'API access']}
 />
 </div>
 </section>

 {/* Footer */}
 <footer className="border-t py-12">
 <div className="container text-center text-sm text-muted-foreground">
 <p> BrandLens. Built with ❤️ for the AI era.</p>
 </div>
 </footer>
 </div>
 );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
 return (
 <div className="p-6 rounded-lg border bg-card">
 <div className="mb-4 text-primary">{icon}</div>
 <h3 className="text-xl font-semibold mb-2">{title}</h3>
 <p className="text-muted-foreground">{description}</p>
 </div>
 );
}

function PricingCard({ name, price, period, description, features, highlighted = false }: {
 name: string;
 price: string;
 period?: string;
 description: string;
 features: string[];
 highlighted?: boolean;
}) {
 return (
 <div className={`p-6 rounded-lg border ${highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
 <h3 className="text-2xl font-bold mb-2">{name}</h3>
 <div className="mb-4">
 <span className="text-4xl font-bold">{price}</span>
 {period && <span className="text-muted-foreground">{period}</span>}
 </div>
 <p className="text-sm text-muted-foreground mb-6">{description}</p>
 <ul className="space-y-3 mb-6">
 {features.map((feature, i) => (
 <li key={i} className="flex items-start">
 <span className="text-primary mr-2">✓</span>
 <span className="text-sm">{feature}</span>
 </li>
 ))}
 </ul>
 <button className={`w-full py-2 px-4 rounded-md ${highlighted ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}>
 Get Started
 </button>
 </div>
 );
}
