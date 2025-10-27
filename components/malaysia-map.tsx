"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

const malaysianStates = [
  { id: "johor", name: "Johor", x: 52, y: 85 },
  { id: "kedah", name: "Kedah", x: 25, y: 20 },
  { id: "kelantan", name: "Kelantan", x: 50, y: 25 },
  { id: "melaka", name: "Melaka", x: 42, y: 70 },
  { id: "negeri-sembilan", name: "Negeri Sembilan", x: 45, y: 72 },
  { id: "pahang", name: "Pahang", x: 52, y: 55 },
  { id: "penang", name: "Penang", x: 22, y: 28 },
  { id: "perak", name: "Perak", x: 32, y: 40 },
  { id: "perlis", name: "Perlis", x: 22, y: 15 },
  { id: "selangor", name: "Selangor", x: 42, y: 62 },
  { id: "terengganu", name: "Terengganu", x: 55, y: 35 },
  { id: "sabah", name: "Sabah", x: 80, y: 25 },
  { id: "sarawak", name: "Sarawak", x: 70, y: 55 },
]

interface MalaysiaMapProps {
  onSelectRegion: (region: string) => void
}

export function MalaysiaMap({ onSelectRegion }: MalaysiaMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".state-marker", {
        scale: 0,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "back.out(1.7)",
      })
    }, mapRef)

    return () => ctx.revert()
  }, [])

  const handleStateClick = (stateId: string, stateName: string) => {
    setSelectedState(stateId)
    gsap.to(`#marker-${stateId}`, {
      scale: 1.3,
      duration: 0.3,
      ease: "back.out(1.7)",
    })
    gsap.to(`.state-marker:not(#marker-${stateId})`, {
      scale: 1,
      duration: 0.3,
    })
  }

  const handleConfirm = () => {
    if (selectedState) {
      const state = malaysianStates.find((s) => s.id === selectedState)
      if (state) {
        onSelectRegion(state.name)
      }
    }
  }

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Select Your Region</h2>
          <p className="text-muted-foreground">Choose the Malaysian state where you want to train AI in your dialect</p>
        </div>

        <div ref={mapRef} className="relative w-full aspect-[4/3] bg-muted/30 rounded-lg overflow-hidden">
          {/* Background map image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/images/malaysia-map.jpg"
              alt="Malaysia Map"
              className="w-full h-full object-contain opacity-40"
            />
          </div>

          {/* Interactive state markers */}
          {malaysianStates.map((state) => (
            <button
              key={state.id}
              id={`marker-${state.id}`}
              className={`state-marker absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                selectedState === state.id ? "z-20" : hoveredState === state.id ? "z-10" : "z-0"
              }`}
              style={{
                left: `${state.x}%`,
                top: `${state.y}%`,
              }}
              onClick={() => handleStateClick(state.id, state.name)}
              onMouseEnter={() => setHoveredState(state.id)}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    selectedState === state.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : hoveredState === state.id
                        ? "bg-primary/70 text-primary-foreground"
                        : "bg-card border-2 border-primary/50 text-primary hover:bg-primary/10"
                  }`}
                >
                  <MapPin className="h-6 w-6" />
                </div>
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedState === state.id || hoveredState === state.id
                      ? "opacity-100 bg-card border border-border shadow-md"
                      : "opacity-0"
                  }`}
                >
                  {state.name}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedState && (
          <div className="text-center space-y-4">
            <p className="text-lg">
              Selected:{" "}
              <span className="font-semibold text-primary">
                {malaysianStates.find((s) => s.id === selectedState)?.name}
              </span>
            </p>
            <Button size="lg" onClick={handleConfirm} className="px-8">
              Start Training
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
