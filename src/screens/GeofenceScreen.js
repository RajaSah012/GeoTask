import { useState, useEffect } from "react"
import { View, StyleSheet, RefreshControl } from "react-native"
import GeofenceList from "../components/GeofenceList"
import GeofenceService from "../services/GeofenceService"

const GeofenceScreen = () => {
  const [geofences, setGeofences] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadGeofences()
  }, [])

  const loadGeofences = async () => {
    try {
      const loadedGeofences = await GeofenceService.getGeofences()
      setGeofences(loadedGeofences)
    } catch (error) {
      console.error("Error loading geofences:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadGeofences()
    setRefreshing(false)
  }

  const handleGeofenceUpdate = () => {
    loadGeofences()
  }

  return (
    <View style={styles.container}>
      <GeofenceList
        geofences={geofences}
        onUpdate={handleGeofenceUpdate}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
})

export default GeofenceScreen
