"use client"

import { useEffect, useRef, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  type MarketplaceProperty,
  type PropertyCategory,
  categoryColors,
  categoryLabels,
} from "@/lib/data/marketplace-listings"

interface MarketplaceMapProps {
  properties: MarketplaceProperty[]
  selectedProperty: MarketplaceProperty | null
  onSelectProperty: (property: MarketplaceProperty) => void
  isFullscreen: boolean
  mapCenter?: [number, number]
  mapZoom?: number
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

function formatPrice(price: number): string {
  if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `AED ${(price / 1000).toFixed(0)}K`
  return `AED ${price.toLocaleString()}`
}

function getCategoryLabel(category: PropertyCategory): string {
  return categoryLabels[category]
}

function getMarkerColor(category: PropertyCategory): string {
  return categoryColors[category].marker
}

export function MarketplaceMap({
  properties,
  selectedProperty,
  onSelectProperty,
  isFullscreen,
  mapCenter = [55.18, 25.06],
  mapZoom = 11.5,
}: MarketplaceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  const createPopupHTML = useCallback((property: MarketplaceProperty) => {
    const color = getMarkerColor(property.category)
    return `
      <div style="font-family: 'Work Sans', system-ui, sans-serif; min-width: 260px; max-width: 300px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${color}22; color: ${color}; border: 1px solid ${color}44;">
            ${getCategoryLabel(property.category)}
          </span>
          <span style="font-size: 11px; color: #888;">${property.type}</span>
        </div>
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: inherit;">${property.title}</div>
        <div style="font-size: 13px; color: #888; margin-bottom: 8px;">${property.area}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; margin-bottom: 8px;">
          <div><span style="color: #888;">Price:</span> <strong>${formatPrice(property.price)}</strong>${property.transactionType === "rent" ? "/yr" : ""}</div>
          <div><span style="color: #888;">Size:</span> <strong>${property.size.toLocaleString()} sqft</strong></div>
          <div><span style="color: #888;">Beds:</span> <strong>${property.bedrooms}</strong></div>
          <div><span style="color: #888;">Plot:</span> <strong>${property.plotNumber}</strong></div>
        </div>
        <div style="font-size: 11px; padding: 6px 8px; border-radius: 6px; background: ${color}11; border-left: 3px solid ${color}; color: inherit;">
          ${property.vacancy}
        </div>
      </div>
    `
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: mapCenter,
      zoom: mapZoom,
      pitch: 40,
      bearing: -10,
      antialias: true,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
    map.current.addControl(new mapboxgl.GeolocateControl(), "top-right")

    return () => {
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when properties change
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    properties.forEach((property) => {
      const color = getMarkerColor(property.category)

      // Create custom marker element
      const el = document.createElement("div")
      el.className = "marketplace-marker"
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
      `

      // Inner dot
      const inner = document.createElement("div")
      inner.style.cssText = `
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `
      el.appendChild(inner)

      el.addEventListener("mouseenter", () => {
        el.style.transform = "rotate(-45deg) scale(1.2)"
        el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4)"
      })
      el.addEventListener("mouseleave", () => {
        el.style.transform = "rotate(-45deg) scale(1)"
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
      })

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(property.coordinates)
        .addTo(map.current!)

      marker.getElement().addEventListener("click", () => {
        onSelectProperty(property)

        // Close any existing popup
        popupRef.current?.remove()

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: "320px",
          className: "marketplace-popup",
        })
          .setLngLat(property.coordinates)
          .setHTML(createPopupHTML(property))
          .addTo(map.current!)

        popupRef.current = popup
      })

      markersRef.current.push(marker)
    })
  }, [properties, onSelectProperty, createPopupHTML])

  // Fly to selected property
  useEffect(() => {
    if (!map.current || !selectedProperty) return

    map.current.flyTo({
      center: selectedProperty.coordinates,
      zoom: 15,
      pitch: 50,
      duration: 1500,
      essential: true,
    })

    // Open popup for selected property
    popupRef.current?.remove()

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      maxWidth: "320px",
      className: "marketplace-popup",
    })
      .setLngLat(selectedProperty.coordinates)
      .setHTML(createPopupHTML(selectedProperty))
      .addTo(map.current)

    popupRef.current = popup
  }, [selectedProperty, createPopupHTML])

  // Handle fullscreen resize
  useEffect(() => {
    if (map.current) {
      setTimeout(() => map.current?.resize(), 100)
    }
  }, [isFullscreen])

  // Update map center/zoom
  useEffect(() => {
    if (!map.current) return
    map.current.flyTo({
      center: mapCenter,
      zoom: mapZoom,
      duration: 1200,
    })
  }, [mapCenter, mapZoom])

  // Dynamic theme support
  useEffect(() => {
    if (!map.current) return

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      map.current?.setStyle(
        isDark
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11"
      )
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Set initial style
    const isDark = document.documentElement.classList.contains("dark")
    if (!isDark) {
      map.current.setStyle("mapbox://styles/mapbox/light-v11")
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
        <div className="flex flex-col gap-1.5 text-xs">
          {(["listing", "off-market", "request"] as PropertyCategory[]).map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ background: getMarkerColor(cat) }}
              />
              <span className="text-muted-foreground">{getCategoryLabel(cat)}</span>
            </div>
          ))}
        </div>
      </div>

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm rounded-xl">
          <div className="text-center p-6">
            <p className="text-sm font-medium mb-1">Mapbox Token Required</p>
            <p className="text-xs text-muted-foreground">
              Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
