"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const malaysianStates = [
  { id: "johor", name: "Johor" },
  { id: "kedah", name: "Kedah" },
  { id: "kelantan", name: "Kelantan" },
  { id: "melaka", name: "Melaka" },
  { id: "negeri-sembilan", name: "Negeri Sembilan" },
  { id: "pahang", name: "Pahang" },
  { id: "penang", name: "Penang" },
  { id: "perak", name: "Perak" },
  { id: "perlis", name: "Perlis" },
  { id: "selangor", name: "Selangor" },
  { id: "terengganu", name: "Terengganu" },
  { id: "sabah", name: "Sabah" },
  { id: "sarawak", name: "Sarawak" },
]

interface MiniMalaysiaMapProps {
  currentRegion?: string
  onRegionChange: (region: string) => void
}

export function MiniMalaysiaMap({ currentRegion, onRegionChange }: MiniMalaysiaMapProps) {
  const [selectedRegion, setSelectedRegion] = useState(currentRegion || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    if (selectedRegion) {
      onRegionChange(selectedRegion)
      localStorage.setItem("userRegion", selectedRegion)
      setIsOpen(false)
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Your Region</h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Your Region</DialogTitle>
              <DialogDescription>Choose the Malaysian state for your dialect training</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {malaysianStates.map((state) => (
                <Button
                  key={state.id}
                  variant={selectedRegion === state.name ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setSelectedRegion(state.name)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {state.name}
                </Button>
              ))}
            </div>
            <Button onClick={handleConfirm} disabled={!selectedRegion} className="w-full">
              Confirm Selection
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
        <MapPin className="h-5 w-5 text-primary" />
        <span className="font-medium">{currentRegion || "Not selected"}</span>
      </div>
    </Card>
  )
}
