"use client"

import { useState } from "react"

const malaysianRegions = [
  { name: "Perlis", x: 7, y: 14, flag: "/images/flags/perlis.png" },
  { name: "Kedah", x: 9, y: 26, flag: "/images/flags/kedah.png" },
  { name: "Penang", x: 2, y: 35, flag: "/images/flags/penang.png" },
  { name: "Perak", x: 10, y: 38, flag: "/images/flags/perak.png" },
  { name: "Kelantan", x: 17, y: 32, flag: "/images/flags/kelantan.png" },
  { name: "Terengganu", x: 24, y: 38, flag: "/images/flags/terengganu.png" },
  { name: "Pahang", x: 22, y: 56, flag: "/images/flags/pahang.png" },
  { name: "Selangor", x: 12, y: 50, flag: "/images/flags/selangor.png" },
  { name: "Kuala Lumpur", x: 9, y: 59, flag: "/images/flags/kuala-lumpur.png" },
  { name: "Putrajaya", x: 15, y: 59, flag: "/images/flags/putrajaya.png" },
  { name: "Negeri Sembilan", x: 14, y: 68, flag: "/images/flags/negeri-sembilan.png" },
  { name: "Melaka", x: 16, y: 78, flag: "/images/flags/melaka.png" },
  { name: "Johor", x: 25, y: 76, flag: "/images/flags/johor.png" },
  { name: "Sabah", x: 84, y: 32, flag: "/images/flags/sabah.png" },
  { name: "Sarawak", x: 62, y: 68, flag: "/images/flags/sarawak.png" },
  { name: "Labuan", x: 70, y: 42, flag: "/images/flags/labuan.png" },
]

interface RegionSelectorProps {
  onSelectRegion: (region: string) => void
}

export function RegionSelector({ onSelectRegion }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const handleRegionClick = (region: string) => {
    setSelectedRegion(region)
    onSelectRegion(region)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        <div className="mb-0 lg:-mb-8 text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl text-foreground font-semibold">Select a State </h1>
          <p className="text-muted-foreground">Click on a flag to start</p>
        </div>

        <div className="relative w-full rounded-2xl p-8">
          <div className="relative w-full aspect-[2/1]">
            <img src="/images/malaysia-map.png" alt="Malaysia Political Map" className="w-full h-full object-contain" />

            {malaysianRegions
              .filter((region) => region.flag)
              .map((region) => (
                <div
                  key={region.name}
                  className="absolute group cursor-pointer p-1"
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => handleRegionClick(region.name)}
                  onMouseEnter={() => setHoveredRegion(region.name)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  <div className="relative">
                    <img
                      src={region.flag || "/placeholder.svg"}
                      alt={`${region.name} flag`}
                      className={`w-[3vw] h-[2.25vw] min-w-[20px] min-h-[15px] max-w-[48px] max-h-[36px] md:w-[5vw] md:h-[3.75vw] md:min-w-[32px] md:min-h-[24px] object-cover rounded shadow-md transition-all duration-300 ${
                        hoveredRegion && hoveredRegion !== region.name ? "opacity-50" : "hover:scale-102"
                      }`}
                    />
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap transition-all duration-200 ${
                        hoveredRegion === region.name
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-1 pointer-events-none"
                      }`}
                    >
                      <div className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                        {region.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
