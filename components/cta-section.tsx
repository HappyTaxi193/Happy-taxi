import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Car, UserPlus } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of users who trust HappyTaxi for their daily commute. Whether you're a passenger or driver,
            we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-4">For Passengers</h3>
            <p className="text-white/90 mb-6">
              Find reliable rides, connect with verified drivers, and travel safely to your destination.
            </p>
            <Button asChild variant="secondary" size="lg" className="w-full">
              <Link href="/auth?role=user">
                Book a Ride
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-4">For Drivers</h3>
            <p className="text-white/90 mb-6">
              Earn money by offering rides, set your own schedule, and help people reach their destinations.
            </p>
            <Button asChild variant="secondary" size="lg" className="w-full">
              <Link href="/auth?role=driver">
                Start Driving
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
