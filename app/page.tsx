"use client"

import type React from "react"
import { useCallback, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  Coffee,
  UtensilsCrossed,
  Wine,
  Building2,
  ShoppingBag,
  Star,
  Clock,
  MapPinIcon,
  Car,
  Clock3,
  CheckCircle,
} from "lucide-react"

const PRESET_LOCATIONS = {
  강남역: { x: 70, y: 60, lat: 37.4979, lng: 127.0276 },
  홍대입구역: { x: 30, y: 40, lat: 37.5563, lng: 126.922 },
  서울역: { x: 50, y: 45, lat: 37.5547, lng: 126.9707 },
  잠실역: { x: 80, y: 55, lat: 37.5132, lng: 127.1001 },
  신촌역: { x: 35, y: 42, lat: 37.5597, lng: 126.9423 },
  역삼역: { x: 68, y: 62, lat: 37.5007, lng: 127.0363 },
  을지로입구역: { x: 52, y: 47, lat: 37.566, lng: 126.9826 },
  건대입구역: { x: 65, y: 50, lat: 37.5403, lng: 127.0693 },
  명동역: { x: 51, y: 48, lat: 37.5636, lng: 126.9834 },
  이태원역: { x: 55, y: 52, lat: 37.5346, lng: 126.9946 },
}

interface Location {
  id: string
  label: string
  address: string
  x?: number
  y?: number
}

interface CenterPoint {
  x: number
  y: number
  address: string
  distances: { [key: string]: string }
}

interface Marker {
  id: string
  x: number
  y: number
  label: string
  color: string
}

interface Participant {
  id: string
  name: string
  color: string
  hasVoted: boolean
}

interface Vote {
  placeId: string
  participantId: string
}

interface Place {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  walkTime: string
  address: string
  image: string
  tags: string[]
  distance: string
  votes?: string[] // participant IDs who voted for this place
}

const PARTICIPANTS: Participant[] = [
  { id: "A", name: "나", color: "#4285F4", hasVoted: false },
  { id: "B", name: "친구1", color: "#0F9D58", hasVoted: false },
  { id: "C", name: "친구2", color: "#F4B400", hasVoted: false },
  { id: "D", name: "친구3", color: "#AB47BC", hasVoted: false },
  { id: "E", name: "친구4", color: "#DB4437", hasVoted: false },
]

const PLACE_CATEGORIES = [
  { id: "cafe", name: "카페", icon: Coffee },
  { id: "restaurant", name: "음식점", icon: UtensilsCrossed },
  { id: "bar", name: "술집", icon: Wine },
  { id: "culture", name: "문화시설", icon: Building2 },
  { id: "shopping", name: "쇼핑", icon: ShoppingBag },
]

const MOCK_PLACES: { [key: string]: Place[] } = {
  cafe: [
    {
      id: "cafe1",
      name: "스타벅스 강남역점",
      category: "cafe",
      rating: 4.2,
      reviewCount: 1247,
      walkTime: "도보 3분",
      address: "서울 강남구 강남대로 390",
      image: "/starbucks-cafe-interior.jpg",
      tags: ["와이파이", "24시간", "테라스"],
      distance: "120m",
    },
    {
      id: "cafe2",
      name: "블루보틀 청담점",
      category: "cafe",
      rating: 4.6,
      reviewCount: 892,
      walkTime: "도보 5분",
      address: "서울 강남구 청담동 123-45",
      image: "/blue-bottle-coffee-modern-interior.jpg",
      tags: ["프리미엄", "조용함", "주차"],
      distance: "280m",
    },
    {
      id: "cafe3",
      name: "투썸플레이스 역삼점",
      category: "cafe",
      rating: 4.1,
      reviewCount: 567,
      walkTime: "도보 4분",
      address: "서울 강남구 역삼동 678-90",
      image: "/twosome-place-cafe-dessert.jpg",
      tags: ["디저트", "와이파이", "단체석"],
      distance: "200m",
    },
    {
      id: "cafe4",
      name: "카페베네 신논현점",
      category: "cafe",
      rating: 3.9,
      reviewCount: 234,
      walkTime: "도보 7분",
      address: "서울 강남구 신논현동 234-56",
      image: "/cafe-bene-cozy-interior.jpg",
      tags: ["저렴함", "와이파이", "흡연실"],
      distance: "350m",
    },
    {
      id: "cafe5",
      name: "할리스커피 테헤란점",
      category: "cafe",
      rating: 4.0,
      reviewCount: 445,
      walkTime: "도보 6분",
      address: "서울 강남구 테헤란로 567",
      image: "/hollys-coffee-business-interior.jpg",
      tags: ["비즈니스", "와이파이", "주차"],
      distance: "300m",
    },
  ],
  restaurant: [
    {
      id: "rest1",
      name: "본죽 강남역점",
      category: "restaurant",
      rating: 4.3,
      reviewCount: 892,
      walkTime: "도보 2분",
      address: "서울 강남구 강남대로 456",
      image: "/korean-porridge-restaurant-interior.jpg",
      tags: ["한식", "건강식", "포장가능"],
      distance: "100m",
    },
    {
      id: "rest2",
      name: "맥도날드 강남점",
      category: "restaurant",
      rating: 4.0,
      reviewCount: 1567,
      walkTime: "도보 4분",
      address: "서울 강남구 테헤란로 234",
      image: "/mcdonalds-restaurant-interior.jpg",
      tags: ["패스트푸드", "24시간", "드라이브스루"],
      distance: "180m",
    },
    {
      id: "rest3",
      name: "김밥천국 역삼점",
      category: "restaurant",
      rating: 4.1,
      reviewCount: 445,
      walkTime: "도보 3분",
      address: "서울 강남구 역삼동 345-67",
      image: "/korean-kimbap-restaurant.jpg",
      tags: ["한식", "저렴함", "빠른배달"],
      distance: "150m",
    },
    {
      id: "rest4",
      name: "서브웨이 신논현점",
      category: "restaurant",
      rating: 4.2,
      reviewCount: 678,
      walkTime: "도보 5분",
      address: "서울 강남구 신논현동 456-78",
      image: "/subway-sandwich-restaurant.jpg",
      tags: ["샐러드", "건강식", "맞춤제작"],
      distance: "220m",
    },
    {
      id: "rest5",
      name: "백종원의 본가 강남점",
      category: "restaurant",
      rating: 4.5,
      reviewCount: 1234,
      walkTime: "도보 8분",
      address: "서울 강남구 강남대로 789",
      image: "/korean-traditional-restaurant-interior.jpg",
      tags: ["한식", "유명맛집", "예약필수"],
      distance: "400m",
    },
  ],
  bar: [
    {
      id: "bar1",
      name: "더 부스 강남점",
      category: "bar",
      rating: 4.4,
      reviewCount: 567,
      walkTime: "도보 6분",
      address: "서울 강남구 강남대로 321",
      image: "/modern-cocktail-bar-interior.jpg",
      tags: ["칵테일", "분위기좋음", "데이트"],
      distance: "280m",
    },
    {
      id: "bar2",
      name: "호프집 역삼점",
      category: "bar",
      rating: 4.1,
      reviewCount: 234,
      walkTime: "도보 4분",
      address: "서울 강남구 역삼동 567-89",
      image: "/korean-beer-pub-interior.jpg",
      tags: ["맥주", "안주", "단체석"],
      distance: "200m",
    },
    {
      id: "bar3",
      name: "와인바 청담",
      category: "bar",
      rating: 4.6,
      reviewCount: 345,
      walkTime: "도보 10분",
      address: "서울 강남구 청담동 678-90",
      image: "/elegant-wine-bar-interior.jpg",
      tags: ["와인", "고급스러움", "조용함"],
      distance: "450m",
    },
    {
      id: "bar4",
      name: "펍 테헤란로",
      category: "bar",
      rating: 4.0,
      reviewCount: 456,
      walkTime: "도보 7분",
      address: "서울 강남구 테헤란로 890",
      image: "/british-style-pub-interior.jpg",
      tags: ["펍", "스포츠중계", "늦은시간"],
      distance: "320m",
    },
    {
      id: "bar5",
      name: "루프탑 바 강남",
      category: "bar",
      rating: 4.7,
      reviewCount: 789,
      walkTime: "도보 12분",
      address: "서울 강남구 강남대로 456",
      image: "/rooftop-bar-city-view.png",
      tags: ["루프탑", "야경", "인스타"],
      distance: "500m",
    },
  ],
  culture: [
    {
      id: "culture1",
      name: "강남 CGV",
      category: "culture",
      rating: 4.3,
      reviewCount: 1234,
      walkTime: "도보 5분",
      address: "서울 강남구 강남대로 456",
      image: "/modern-movie-theater-interior.jpg",
      tags: ["영화관", "최신시설", "주차"],
      distance: "250m",
    },
    {
      id: "culture2",
      name: "코엑스 아쿠아리움",
      category: "culture",
      rating: 4.5,
      reviewCount: 2345,
      walkTime: "도보 15분",
      address: "서울 강남구 영동대로 513",
      image: "/aquarium-with-colorful-fish.jpg",
      tags: ["수족관", "가족", "체험"],
      distance: "800m",
    },
    {
      id: "culture3",
      name: "선정릉",
      category: "culture",
      rating: 4.2,
      reviewCount: 567,
      walkTime: "도보 20분",
      address: "서울 강남구 삼성동 135",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["역사", "산책", "무료"],
      distance: "1.2km",
    },
    {
      id: "culture4",
      name: "봉은사",
      category: "culture",
      rating: 4.4,
      reviewCount: 890,
      walkTime: "도보 18분",
      address: "서울 강남구 삼성동 73",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["사찰", "전통", "힐링"],
      distance: "1.0km",
    },
    {
      id: "culture5",
      name: "강남 아트센터",
      category: "culture",
      rating: 4.1,
      reviewCount: 345,
      walkTime: "도보 8분",
      address: "서울 강남구 테헤란로 678",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["갤러리", "전시", "문화"],
      distance: "380m",
    },
  ],
  shopping: [
    {
      id: "shop1",
      name: "강남역 지하상가",
      category: "shopping",
      rating: 4.0,
      reviewCount: 1567,
      walkTime: "도보 2분",
      address: "서울 강남구 강남대로 지하",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["지하상가", "저렴함", "다양함"],
      distance: "80m",
    },
    {
      id: "shop2",
      name: "현대백화점 무역센터점",
      category: "shopping",
      rating: 4.4,
      reviewCount: 2234,
      walkTime: "도보 12분",
      address: "서울 강남구 테헤란로 517",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["백화점", "명품", "주차"],
      distance: "600m",
    },
    {
      id: "shop3",
      name: "코엑스몰",
      category: "shopping",
      rating: 4.3,
      reviewCount: 3456,
      walkTime: "도보 15분",
      address: "서울 강남구 영동대로 513",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["쇼핑몰", "대형", "먹거리"],
      distance: "750m",
    },
    {
      id: "shop4",
      name: "가로수길",
      category: "shopping",
      rating: 4.2,
      reviewCount: 1890,
      walkTime: "도보 10분",
      address: "서울 강남구 신사동 가로수길",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["패션", "트렌디", "카페"],
      distance: "500m",
    },
    {
      id: "shop5",
      name: "롯데백화점 강남점",
      category: "shopping",
      rating: 4.3,
      reviewCount: 1678,
      walkTime: "도보 7분",
      address: "서울 강남구 강남대로 240",
      image: "/placeholder.svg?height=80&width=80",
      tags: ["백화점", "브랜드", "식당가"],
      distance: "350m",
    },
  ],
}

export default function MeetPointApp() {
  const [personCount, setPersonCount] = useState<number>(2)
  const [locations, setLocations] = useState<Location[]>([])
  const [centerPoint, setCenterPoint] = useState<CenterPoint | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [centerMarker, setCenterMarker] = useState<Marker | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMobileFormExpanded, setIsMobileFormExpanded] = useState(false)
  const [searchResults, setSearchResults] = useState<{ [key: string]: string[] }>({})

  const [showPlaceSearch, setShowPlaceSearch] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("cafe")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [sortBy, setSortBy] = useState("distance")
  const [filters, setFilters] = useState<string[]>([])

  const [participantCount, setParticipantCount] = useState(5)
  const [participants, setParticipants] = useState<Participant[]>(PARTICIPANTS.slice(0, 5))
  const [votes, setVotes] = useState<Vote[]>([])
  const [votingTimeLeft, setVotingTimeLeft] = useState(180) // 3 minutes
  const [showVotingResults, setShowVotingResults] = useState(false)
  const [isVotingActive, setIsVotingActive] = useState(false)

  useEffect(() => {
    const newLocations: Location[] = []
    for (let i = 0; i < personCount; i++) {
      const label = String.fromCharCode(65 + i) // A, B, C, D, E
      newLocations.push({
        id: `person-${label}`,
        label: `Person ${label}`,
        address: "",
      })
    }
    setLocations(newLocations)
    setCenterPoint(null)
    setMarkers([])
    setCenterMarker(null)
  }, [personCount])

  useEffect(() => {
    const runDemo = () => {
      console.log("[v0] Starting demo...")

      setTimeout(() => {
        console.log("[v0] Setting location A to 강남역")
        updateLocationAddress("person-A", "강남역")
        setTimeout(() => searchAddress("person-A"), 100)
      }, 1000)

      setTimeout(() => {
        console.log("[v0] Setting location B to 홍대입구역")
        updateLocationAddress("person-B", "홍대입구역")
        setTimeout(() => searchAddress("person-B"), 100)
      }, 2000)

      setTimeout(() => {
        console.log("[v0] Attempting to calculate center...")
        const validLocs = locations.filter((loc) => loc.x !== undefined && loc.y !== undefined)
        console.log("[v0] Valid locations before calculation:", validLocs)
        if (validLocs.length >= 2) {
          calculateCenter()
        } else {
          // Force set coordinates if demo locations aren't set properly
          console.log("[v0] Force setting demo coordinates...")
          setLocations((prev) =>
            prev.map((loc) => {
              if (loc.id === "person-A") {
                return { ...loc, address: "강남역", x: 70, y: 60 }
              } else if (loc.id === "person-B") {
                return { ...loc, address: "홍대입구역", x: 30, y: 40 }
              }
              return loc
            }),
          )

          // Try calculating again after setting coordinates
          setTimeout(() => {
            calculateCenter()
          }, 500)
        }
      }, 3500)
    }

    // Run demo on first load
    if (locations.length === 2 && !showPlaceSearch) {
      runDemo()
    }
  }, [locations.length, showPlaceSearch])

  const updateLocationAddress = (id: string, address: string) => {
    setLocations((prev) => prev.map((loc) => (loc.id === id ? { ...loc, address } : loc)))

    if (address.length > 0) {
      const results = searchAddressSimulation(address)
      setSearchResults((prev) => ({ ...prev, [id]: results }))
    } else {
      setSearchResults((prev) => ({ ...prev, [id]: [] }))
    }
  }

  const searchAddressSimulation = (query: string): string[] => {
    return Object.keys(PRESET_LOCATIONS)
      .filter((name) => name.includes(query))
      .slice(0, 5)
  }

  const searchAddress = (id: string) => {
    const location = locations.find((loc) => loc.id === id)
    if (!location || !location.address) return

    const matchedLocation = Object.entries(PRESET_LOCATIONS).find(
      ([name]) => name.includes(location.address) || location.address.includes(name),
    )

    if (matchedLocation) {
      const [name, coords] = matchedLocation
      const label = location.label.split(" ")[1] // Get A, B, C, etc.

      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, address: name, x: coords.x, y: coords.y } : loc)),
      )

      createOrUpdateMarker(id, coords.x, coords.y, label, "#4285F4")
      setSearchResults((prev) => ({ ...prev, [id]: [] }))
    } else {
      alert("주소를 찾을 수 없습니다. 서울 지역 주요 역명을 입력해주세요.")
    }
  }

  const getCurrentLocation = (id: string) => {
    const coords = PRESET_LOCATIONS["서울역"]
    const label = locations.find((loc) => loc.id === id)?.label.split(" ")[1] || "A"

    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, address: "서울역", x: coords.x, y: coords.y } : loc)),
    )

    createOrUpdateMarker(id, coords.x, coords.y, label, "#4285F4")
  }

  const createOrUpdateMarker = (id: string, x: number, y: number, label: string, color: string) => {
    const newMarker: Marker = { id, x, y, label, color }

    setMarkers((prev) => {
      const filtered = prev.filter((m) => m.id !== id)
      return [...filtered, newMarker]
    })
  }

  const calculateCenter = () => {
    const validLocations = locations.filter((loc) => loc.x !== undefined && loc.y !== undefined)

    console.log("[v0] Calculate center called with locations:", locations)
    console.log("[v0] Valid locations:", validLocations)

    if (validLocations.length < 2) {
      console.log("[v0] Not enough valid locations yet, waiting...")
      return
    }

    console.log("[v0] Starting center calculation with locations:", validLocations)
    setIsCalculating(true)

    let sumX = 0,
      sumY = 0
    validLocations.forEach((loc) => {
      sumX += loc.x!
      sumY += loc.y!
    })

    const centerX = sumX / validLocations.length
    const centerY = sumY / validLocations.length

    const centerAddress = findNearestLocation(centerX, centerY)

    const distances: { [key: string]: string } = {}
    validLocations.forEach((loc) => {
      const distance = calculateDistance({ x: centerX, y: centerY }, { x: loc.x!, y: loc.y! })
      distances[loc.label] = distance
    })

    setCenterPoint({ x: centerX, y: centerY, address: centerAddress, distances })

    const centerMarkerObj: Marker = {
      id: "center",
      x: centerX,
      y: centerY,
      label: "중심",
      color: "#FF6B6B",
    }
    setCenterMarker(centerMarkerObj)

    console.log("[v0] Center calculated, showing place search")
    setTimeout(() => {
      setIsCalculating(false)
      setShowPlaceSearch(true)
      console.log("[v0] Place search should now be visible:", true)
    }, 1000)
  }

  const handleCalculateCenter = () => {
    const validLocations = locations.filter((loc) => loc.x !== undefined && loc.y !== undefined)

    if (validLocations.length < 2) {
      alert("최소 2개의 위치가 필요합니다.")
      return
    }

    calculateCenter()
  }

  const findNearestLocation = (x: number, y: number): string => {
    let nearest = null
    let minDistance = Number.POSITIVE_INFINITY

    Object.entries(PRESET_LOCATIONS).forEach(([name, loc]) => {
      const distance = Math.sqrt((loc.x - x) ** 2 + (loc.y - y) ** 2)
      if (distance < minDistance) {
        minDistance = distance
        nearest = name
      }
    })

    return `${nearest} 인근`
  }

  const calculateDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }): string => {
    const pixelDistance = Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2)

    // Convert pixels to km (100 pixels ≈ 10km for Seoul)
    const kmDistance = (pixelDistance / 10).toFixed(1)
    return `약 ${kmDistance}km`
  }

  const loadPreset = (type: string) => {
    setMarkers([])
    setCenterMarker(null)
    setCenterPoint(null)

    if (type === "friends") {
      setPersonCount(3)
      setTimeout(() => {
        updateLocationAddress("person-A", "강남역")
        updateLocationAddress("person-B", "홍대입구역")
        updateLocationAddress("person-C", "잠실역")
        searchAddress("person-A")
        searchAddress("person-B")
        searchAddress("person-C")
        setTimeout(() => calculateCenter(), 1000)
      }, 500)
    } else if (type === "business") {
      setPersonCount(2)
      setTimeout(() => {
        updateLocationAddress("person-A", "역삼역")
        updateLocationAddress("person-B", "을지로입구역")
        searchAddress("person-A")
        searchAddress("person-B")
        setTimeout(() => calculateCenter(), 1000)
      }, 500)
    } else if (type === "date") {
      setPersonCount(2)
      setTimeout(() => {
        updateLocationAddress("person-A", "명동역")
        updateLocationAddress("person-B", "이태원역")
        searchAddress("person-A")
        searchAddress("person-B")
        setTimeout(() => calculateCenter(), 1000)
      }, 500)
    }
  }

  const resetAll = () => {
    setLocations((prev) => prev.map((loc) => ({ ...loc, address: "", x: undefined, y: undefined })))
    setCenterPoint(null)
    setMarkers([])
    setCenterMarker(null)
    setSearchResults({})
  }

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Find nearest preset location
    const nearestLocation = findNearestLocation(x, y)
    console.log(`Clicked at (${x.toFixed(1)}, ${y.toFixed(1)}) - Nearest: ${nearestLocation}`)
  }

  const getFilteredPlaces = useCallback(() => {
    let places = MOCK_PLACES[selectedCategory] || []

    // Apply filters
    if (filters.includes("parking")) {
      places = places.filter((place) => place.tags.includes("주차"))
    }
    if (filters.includes("24hours")) {
      places = places.filter((place) => place.tags.includes("24시간"))
    }
    if (filters.includes("reservation")) {
      places = places.filter((place) => place.tags.includes("예약가능") || place.tags.includes("예약필수"))
    }

    // Sort places
    switch (sortBy) {
      case "rating":
        places = places.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        places = places.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case "distance":
      default:
        places = places.sort((a, b) => Number.parseInt(a.distance) - Number.parseInt(b.distance))
        break
    }

    return places
  }, [selectedCategory, filters, sortBy])

  const getParticipantVotingStatus = useCallback(() => {
    return participants.map((p) => ({
      ...p,
      hasVoted: votes.some((v) => v.participantId === p.id),
    }))
  }, [participants, votes])

  const selectPlace = (place: Place) => {
    setSelectedPlace(place)
    // Add place marker to map
    if (centerPoint) {
      const placeMarker: Marker = {
        id: "selected-place",
        x: centerPoint.x + (Math.random() - 0.5) * 5, // Random position near center
        y: centerPoint.y + (Math.random() - 0.5) * 5,
        label: "📍",
        color: "#10B981",
      }
      setMarkers((prev) => [...prev.filter((m) => m.id !== "selected-place"), placeMarker])
    }
  }

  const toggleFilter = (filter: string) => {
    setFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const toggleVote = (placeId: string, participantId = "A") => {
    setVotes((prev) => {
      const existingVote = prev.find((v) => v.placeId === placeId && v.participantId === participantId)
      if (existingVote) {
        return prev.filter((v) => !(v.placeId === placeId && v.participantId === participantId))
      } else {
        return [...prev, { placeId, participantId }]
      }
    })
  }

  const getVotesForPlace = (placeId: string) => {
    return votes.filter((v) => v.placeId === placeId)
  }

  const getVotePercentage = (placeId: string) => {
    const placeVotes = getVotesForPlace(placeId).length
    return (placeVotes / participantCount) * 100
  }

  const hasUserVoted = (placeId: string, participantId = "A") => {
    return votes.some((v) => v.placeId === placeId && v.participantId === participantId)
  }

  const getTopPlace = () => {
    const placesWithVotes = getFilteredPlaces().map((place) => ({
      ...place,
      voteCount: getVotesForPlace(place.id).length,
    }))
    return placesWithVotes.sort((a, b) => b.voteCount - a.voteCount)[0]
  }

  useEffect(() => {
    if (isVotingActive && votingTimeLeft > 0) {
      const timer = setInterval(() => {
        setVotingTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (votingTimeLeft === 0) {
      setShowVotingResults(true)
      setIsVotingActive(false)
    }
  }, [isVotingActive, votingTimeLeft])

  useEffect(() => {
    if (isVotingActive) {
      const interval = setInterval(() => {
        setVotes((currentVotes) => {
          const currentParticipants = participants
          const currentPlaces = getFilteredPlaces()

          const unvotedParticipants = currentParticipants.filter(
            (p) => p.id !== "A" && !currentVotes.some((v) => v.participantId === p.id),
          )

          if (unvotedParticipants.length > 0) {
            const randomParticipant = unvotedParticipants[Math.floor(Math.random() * unvotedParticipants.length)]
            const newVotes = [...currentVotes]

            // Sometimes vote for multiple places
            const votesCount = Math.random() > 0.7 ? 2 : 1
            for (let i = 0; i < votesCount; i++) {
              const place = currentPlaces[Math.floor(Math.random() * currentPlaces.length)]
              if (!newVotes.some((v) => v.placeId === place.id && v.participantId === randomParticipant.id)) {
                newVotes.push({ placeId: place.id, participantId: randomParticipant.id })
              }
            }

            return newVotes
          }

          return currentVotes
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isVotingActive]) // Removed participants and votes from dependencies to prevent infinite loop

  useEffect(() => {
    if (showPlaceSearch && !isVotingActive) {
      setIsVotingActive(true)
      setVotingTimeLeft(180)
    }
  }, [showPlaceSearch, isVotingActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative">
        {/* Place Search Results with Voting */}
        {showPlaceSearch && (
          <div
            className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-2xl transition-all duration-500 ease-out h-[70vh] md:h-[50vh] overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            <div className="h-full flex flex-col" style={{ zIndex: 10000 }}>
              <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">🎯 중간지점 주변 장소</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("[v0] Closing place search")
                      setShowPlaceSearch(false)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800">🗳️ 투표 현황</h4>
                    <div className="flex items-center gap-2">
                      <Select
                        value={participantCount.toString()}
                        onValueChange={(value) => {
                          const count = Number.parseInt(value)
                          setParticipantCount(count)
                          setParticipants(PARTICIPANTS.slice(0, count))
                        }}
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2명</SelectItem>
                          <SelectItem value="3">3명</SelectItem>
                          <SelectItem value="4">4명</SelectItem>
                          <SelectItem value="5">5명</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTopPlace() && (
                        <div className="text-xs font-medium text-gray-700">
                          🥇 현재 1위: {getTopPlace().name} ({getVotesForPlace(getTopPlace().id).length}표)
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-600">⏱️ {formatTime(votingTimeLeft)}</div>
                  </div>

                  <div className="flex items-center gap-1 mt-2">
                    {getParticipantVotingStatus().map((participant) => (
                      <div
                        key={participant.id}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          participant.hasVoted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: participant.color }}
                        >
                          {participant.id}
                        </div>
                        {participant.hasVoted ? "✅" : "⏳"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1 mb-3 overflow-x-auto">
                  {PLACE_CATEGORIES.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-1 whitespace-nowrap ${
                          selectedCategory === category.id
                            ? "bg-blue-500 text-white"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <IconComponent className="h-3 w-3" />
                        {category.name}
                      </Button>
                    )
                  })}
                </div>

                {/* Sort and Filter Bar */}
                <div className="flex items-center gap-3 text-sm">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">거리순</SelectItem>
                      <SelectItem value="rating">평점순</SelectItem>
                      <SelectItem value="reviews">리뷰순</SelectItem>
                      <SelectItem value="votes">투표순</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant={filters.includes("parking") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("parking")}
                      className="h-8 text-xs"
                    >
                      <Car className="h-3 w-3 mr-1" />
                      주차
                    </Button>
                    <Button
                      variant={filters.includes("24hours") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("24hours")}
                      className="h-8 text-xs"
                    >
                      <Clock3 className="h-3 w-3 mr-1" />
                      24시간
                    </Button>
                    <Button
                      variant={filters.includes("reservation") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("reservation")}
                      className="h-8 text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      예약
                    </Button>
                  </div>
                </div>
              </div>

              {/* Place List with Voting */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {getFilteredPlaces().map((place) => {
                    const placeVotes = getVotesForPlace(place.id)
                    const votePercentage = getVotePercentage(place.id)
                    const userHasVoted = hasUserVoted(place.id)

                    return (
                      <Card
                        key={place.id}
                        className={`transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                          selectedPlace?.id === place.id ? "ring-2 ring-blue-500 border-blue-500" : ""
                        }`}
                      >
                        <CardContent className="p-0">
                          <div className="p-3">
                            <div className="flex gap-3">
                              {/* Thumbnail */}
                              <div className="flex-shrink-0">
                                <img
                                  src={place.image || "/placeholder.svg"}
                                  alt={place.name}
                                  className="w-16 h-16 rounded-lg object-cover transition-transform duration-200 hover:scale-105"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">{place.name}</h4>
                                  <Button
                                    size="sm"
                                    variant={selectedPlace?.id === place.id ? "default" : "outline"}
                                    className="ml-2 h-6 px-2 text-xs"
                                    onClick={() => selectPlace(place)}
                                  >
                                    {selectedPlace?.id === place.id ? "선택됨" : "선택"}
                                  </Button>
                                </div>

                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-gray-600">{place.rating}</span>
                                    <span className="text-xs text-gray-400">({place.reviewCount})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">{place.walkTime}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPinIcon className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">{place.distance}</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-2">
                                  {place.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Voting Section */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Button
                                      size="sm"
                                      variant={userHasVoted ? "default" : "outline"}
                                      onClick={() => toggleVote(place.id)}
                                      className={`h-6 px-2 text-xs transition-all duration-200 ${
                                        userHasVoted
                                          ? "bg-blue-500 text-white hover:bg-blue-600"
                                          : "hover:bg-blue-50 hover:border-blue-300"
                                      }`}
                                    >
                                      {userHasVoted ? "👍 투표함" : "👍 투표하기"}
                                    </Button>
                                    <div className="text-xs text-gray-600">
                                      {placeVotes.length}표 ({votePercentage.toFixed(0)}%)
                                    </div>
                                  </div>

                                  {/* Vote Progress Bar */}
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${votePercentage}%` }}
                                    />
                                  </div>

                                  {/* Voter Avatars */}
                                  {placeVotes.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">투표자:</span>
                                      <div className="flex gap-1">
                                        {placeVotes.map((vote) => {
                                          const participant = participants.find((p) => p.id === vote.participantId)
                                          return (
                                            <div
                                              key={vote.participantId}
                                              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                              style={{ backgroundColor: participant?.color }}
                                              title={participant?.name}
                                            >
                                              {vote.participantId}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {showVotingResults && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4"
            style={{ zIndex: 200 }}
          >
            <div className="bg-white rounded-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-300 relative z-[201]">
              <h2 className="text-xl font-bold text-center mb-4">📊 투표 결과</h2>

              {getTopPlace() && (
                <div className="text-center mb-6">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-lg font-semibold text-gray-900">{getTopPlace().name}</h3>
                  <p className="text-sm text-gray-600">
                    {getVotesForPlace(getTopPlace().id).length}/{participantCount} 표 획득
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-6">
                {getFilteredPlaces()
                  .map((place) => ({
                    ...place,
                    voteCount: getVotesForPlace(place.id).length,
                  }))
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .slice(0, 3)
                  .map((place, index) => (
                    <div key={place.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                        <span className="text-sm">{place.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{place.voteCount}표</span>
                        <div className="flex gap-1">
                          {getVotesForPlace(place.id).map((vote) => {
                            const participant = participants.find((p) => p.id === vote.participantId)
                            return (
                              <div
                                key={vote.participantId}
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: participant?.color }}
                              >
                                {vote.participantId}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    if (getTopPlace()) {
                      selectPlace(getTopPlace())
                    }
                    setShowVotingResults(false)
                  }}
                >
                  이곳에서 만나기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVotes([])
                    setVotingTimeLeft(180)
                    setIsVotingActive(true)
                    setShowVotingResults(false)
                  }}
                >
                  다시 투표
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Calculate Center Button */}
        <Button
          onClick={handleCalculateCenter}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
          disabled={isCalculating}
        >
          중간지점 계산하기
        </Button>
      </main>
    </div>
  )
}
