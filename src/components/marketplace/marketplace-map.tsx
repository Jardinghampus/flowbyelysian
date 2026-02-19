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
    const waMessage = encodeURIComponent(
      `Hi! I'm interested in "${property.title}" in ${property.area} (${formatPrice(property.price)}). Can I get more details?`
    )
    const shareUrl = encodeURIComponent(
      typeof window !== "undefined"
        ? `${window.location.origin}/marketplace?property=${property.id}`
        : ""
    )
    const shareText = encodeURIComponent(`Check out ${property.title} in ${property.area} - ${formatPrice(property.price)}`)

    return `
      <div style="font-family: 'Work Sans', system-ui, sans-serif; min-width: 260px; max-width: 300px; color: #1a1a1a;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${color}22; color: ${color}; border: 1px solid ${color}44;">
            ${getCategoryLabel(property.category)}
          </span>
          <span style="font-size: 11px; color: #666;">${property.type}</span>
        </div>
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111;">${property.title}</div>
        <div style="font-size: 13px; color: #666; margin-bottom: 8px;">${property.area}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; margin-bottom: 8px; color: #333;">
          <div><span style="color: #888;">Price:</span> <strong style="color: #111;">${formatPrice(property.price)}</strong>${property.transactionType === "rent" ? "/yr" : ""}</div>
          <div><span style="color: #888;">Size:</span> <strong style="color: #111;">${property.size.toLocaleString()} sqft</strong></div>
          <div><span style="color: #888;">Beds:</span> <strong style="color: #111;">${property.bedrooms}</strong></div>
          <div><span style="color: #888;">Plot:</span> <strong style="color: #111;">${property.plotNumber}</strong></div>
        </div>
        <div style="font-size: 11px; padding: 6px 8px; border-radius: 6px; background: ${color}11; border-left: 3px solid ${color}; color: #333; margin-bottom: 10px;">
          ${property.vacancy}
        </div>
        <div style="font-size: 11px; padding: 6px 8px; border-radius: 6px; background: #f0f9ff; border: 1px solid #e0f2fe; color: #444; margin-bottom: 10px; line-height: 1.5;">
          <span style="color: ${color}; font-weight: 600;">AI:</span> ${property.aiSummary}
        </div>
        <div style="display: flex; gap: 6px;">
          <a href="https://wa.me/?text=${waMessage}" target="_blank" rel="noopener noreferrer"
             style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 10px; border-radius: 8px; background: #25d366; color: white; font-size: 11px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: opacity 0.2s;"
             onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Interested
          </a>
          <button onclick="navigator.clipboard.writeText('${typeof window !== "undefined" ? window.location.origin : ""}/marketplace?property=${property.id}').then(function(){var b=event.target.closest('button');b.innerHTML='Copied!';b.style.background='#10b981';b.style.color='white';setTimeout(function(){b.innerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><path d=\\'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8\\'></path><polyline points=\\'16 6 12 2 8 6\\'></polyline><line x1=\\'12\\' y1=\\'2\\' x2=\\'12\\' y2=\\'15\\'></line></svg> Share';b.style.background='#f3f4f6';b.style.color='#374151'},1500)})"
             style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 10px; border-radius: 8px; background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid #e5e7eb; transition: background 0.2s;"
             onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            Share
          </button>
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
          maxWidth: "340px",
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
      maxWidth: "340px",
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
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-neutral-700 shadow-lg">
        <div className="flex flex-col gap-1.5 text-xs">
          {(["listing", "off-market", "request"] as PropertyCategory[]).map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ background: getMarkerColor(cat) }}
              />
              <span className="text-gray-700 dark:text-neutral-300">{getCategoryLabel(cat)}</span>
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
