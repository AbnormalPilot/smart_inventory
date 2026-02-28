import * as React from "react"

const FALLBACK_COORDS = { latitude: 18.6298, longitude: 73.9131 } // Ajeenkya DY Patil University, Lohegaon

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = React.useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        ...FALLBACK_COORDS,
        accuracy: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      })
      return
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      })
    }

    const onError = (err: GeolocationPositionError) => {
      setState({
        ...FALLBACK_COORDS,
        accuracy: null,
        error: err.message,
        loading: false,
      })
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    })
  }, [])

  return state
}
