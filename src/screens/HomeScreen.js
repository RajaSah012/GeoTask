import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from "react-native"
import GeofenceService from "../services/GeofenceService"

const HomeScreen = ({ navigation }) => {
  const [trackingStatus, setTrackingStatus] = useState({
    isTracking: false,
    geofenceCount: 0,
    lastLocation: null,
  })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    updateTrackingStatus()
    // Test notification on start
    // setTimeout(() => {
    //   GeofenceService.testNotifications()
    // }, 1000)
  }, [])

  const updateTrackingStatus = () => {
    const status = GeofenceService.getTrackingStatus()
    setTrackingStatus(status)
  }

  const handleStartTracking = async () => {
    try {
      await GeofenceService.startTracking()
      updateTrackingStatus()
      Alert.alert("Success", "Tracking started successfully!")
    } catch (error) {
      Alert.alert("Error", "Failed to start tracking")
    }
  }

  const handleStopTracking = () => {
    Alert.alert("Stop Tracking", "Stop geofence monitoring?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Stop",
        onPress: () => {
          GeofenceService.stopTracking()
          updateTrackingStatus()
        },
      },
    ])
  }

  const onRefresh = async () => {
    setRefreshing(true)
    updateTrackingStatus()
    setRefreshing(false)
  }

  const formatLocation = (location) => {
    if (!location) return "No location"
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
  }

  const navigateToScreen = (screenName) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screenName)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ Geofence Monitor</Text>
        <Text style={styles.subtitle}>Simple location monitoring</Text>
      </View>

      {/* Tracking Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📍 Tracking Status</Text>
          <View
            style={[
              styles.statusIndicator,
              trackingStatus.isTracking ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
          >
            <Text style={[styles.statusText, trackingStatus.isTracking ? styles.activeText : styles.inactiveText]}>
              {trackingStatus.isTracking ? "🟢 Active" : "🔴 Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Geofences</Text>
            <Text style={styles.statValue}>{trackingStatus.geofenceCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Location</Text>
            <Text style={styles.statValue}>{formatLocation(trackingStatus.lastLocation)}</Text>
          </View>
        </View>

        <View style={styles.trackingControls}>
          {trackingStatus.isTracking ? (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStopTracking}>
              <Text style={styles.buttonText}>⏹️ Stop Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStartTracking}>
              <Text style={styles.buttonText}>▶️ Start Tracking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Navigation Cards */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen("Map")}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navTitle}>Map View</Text>
          <Text style={styles.navSubtitle}>Add geofences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen("Geofences")}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navTitle}>Geofence List</Text>
          <Text style={styles.navSubtitle}>Manage geofences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen("Events")}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navTitle}>Event History</Text>
          <Text style={styles.navSubtitle}>View events</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Quick Actions</Text>

        <TouchableOpacity style={styles.quickAction} onPress={() => navigateToScreen("Map")}>
          <Text style={styles.quickActionText}>➕ Add New Geofence</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={async () => {
            try {
              const location = await GeofenceService.getCurrentLocation()
              Alert.alert(
                "📍 Current Location",
                `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\nAccuracy: ±${location.accuracy}m`,
              )
            } catch (error) {
              Alert.alert("Error", "Unable to get location")
            }
          }}
        >
          <Text style={styles.quickActionText}>📍 Get Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => GeofenceService.testNotifications()}>
          <Text style={styles.quickActionText}>🧪 Test Notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeIndicator: {
    backgroundColor: "#E8F5E8",
  },
  inactiveIndicator: {
    backgroundColor: "#FFE8E8",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeText: {
    color: "#34C759",
  },
  inactiveText: {
    color: "#FF3B30",
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  trackingControls: {
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 150,
  },
  startButton: {
    backgroundColor: "#34C759",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  navCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  navSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  quickAction: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
})

export default HomeScreen
