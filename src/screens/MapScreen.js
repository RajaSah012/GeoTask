import { useState, useEffect } from "react"
import { View, StyleSheet, Alert, ActivityIndicator, Text } from "react-native"
import CustomMapView from "../components/MapView"
import GeofenceService from "../services/GeofenceService"

const MapScreen = () => {
  const [geofences, setGeofences] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeScreen()
  }, [])

  const initializeScreen = async () => {
    try {
      // Load geofences
      await loadGeofences()

      // Get current location (mock for demo)
      const location = await GeofenceService.getCurrentLocation()
      setCurrentLocation(location)
    } catch (error) {
      Alert.alert("Error", "Failed to initialize map.")
    } finally {
      setLoading(false)
    }
  }

  const loadGeofences = async () => {
    try {
      const loadedGeofences = await GeofenceService.getGeofences()
      setGeofences(loadedGeofences)
    } catch (error) {
      // Silent fail
    }
  }

  const handleGeofenceAdded = () => {
    loadGeofences()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CustomMapView geofences={geofences} currentLocation={currentLocation} onAddGeofence={handleGeofenceAdded} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
})

export default MapScreen
