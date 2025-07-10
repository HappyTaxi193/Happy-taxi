import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, DollarSign, Users, MapPin, Star } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All drivers are verified with proper documentation and background checks.",
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Book rides anytime, anywhere. Our platform is always ready to serve you.",
    },
    {
      icon: DollarSign,
      title: "Affordable Pricing",
      description: "Competitive rates with transparent pricing. No hidden charges.",
    },
    {
      icon: Users,
      title: "Shared Rides",
      description: "Share your journey with others and split the cost for economical travel.",
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Track your ride in real-time and stay informed about your journey.",
    },
    {
      icon: Star,
      title: "Rated Drivers",
      description: "Choose from highly rated and experienced drivers for your peace of mind.",
    },
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose HappyTaxi?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our premium features designed for your comfort and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
