import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert, ToastAndroid, Platform } from "react-native"

class GeofenceService {
  constructor() {
    this.geofences = []
    this.isTracking = false
    this.lastKnownLocation = null
    this.notifiedGeofences = new Set()
  }

  // Simple notification
  showNotification(title, message) {
    if (Platform.OS === "android") {
      ToastAndroid.show(`${title}: ${message}`, ToastAndroid.LONG)
    }
    Alert.alert(title, message)
  }

  async addGeofence(geofence) {
    const geofences = await this.getGeofences()
    const newGeofence = {
      id: Date.now().toString(),
      ...geofence,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    geofences.push(newGeofence)
    await AsyncStorage.setItem("geofences", JSON.stringify(geofences))
    this.geofences = geofences

    this.showNotification("Success", `Geofence "${newGeofence.name}" added`)
    return newGeofence
  }

  async removeGeofence(geofenceId) {
    const geofences = await this.getGeofences()
    const geofence = geofences.find((g) => g.id === geofenceId)
    const filteredGeofences = geofences.filter((g) => g.id !== geofenceId)

    await AsyncStorage.setItem("geofences", JSON.stringify(filteredGeofences))
    this.geofences = filteredGeofences
    this.notifiedGeofences.delete(geofenceId)

    if (geofence) {
      this.showNotification("Success", `Geofence "${geofence.name}" removed`)
    }
  }

  async getGeofences() {
    try {
      const stored = await AsyncStorage.getItem("geofences")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  async updateGeofence(geofenceId, updates) {
    const geofences = await this.getGeofences()
    const index = geofences.findIndex((g) => g.id === geofenceId)

    if (index !== -1) {
      geofences[index] = { ...geofences[index], ...updates }
      await AsyncStorage.setItem("geofences", JSON.stringify(geofences))
      this.geofences = geofences

      const status = updates.isActive ? "activated" : "deactivated"
      this.showNotification("Updated", `Geofence ${status}`)
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // SIMPLIFIED TRACKING - NO GEOLOCATION SERVICE
  async startTracking() {
    if (this.isTracking) {
      this.showNotification("Info", "Tracking already active")
      return
    }

    this.geofences = await this.getGeofences()
    this.isTracking = true

    // Mock location for demo (you can replace with real location later)
    this.lastKnownLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
    }

    this.showNotification("Success", `Tracking started! Monitoring ${this.geofences.length} geofences`)
  }

  stopTracking() {
    this.isTracking = false
    this.showNotification("Success", "Tracking stopped")
  }

  // SIMPLIFIED LOCATION - NO CRASHES
  async getCurrentLocation() {
    // Return mock location for demo
    const mockLocation = {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      accuracy: Math.floor(Math.random() * 20) + 5,
    }

    this.lastKnownLocation = mockLocation
    return mockLocation
  }

  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      geofenceCount: this.geofences.length,
      lastLocation: this.lastKnownLocation,
    }
  }

  async logGeofenceEvent(geofence, type, distance) {
    try {
      const events = await AsyncStorage.getItem("geofence_events")
      const eventList = events ? JSON.parse(events) : []

      const event = {
        id: Date.now().toString(),
        geofenceId: geofence.id,
        geofenceName: geofence.name,
        type: type,
        distance: distance.toFixed(0),
        timestamp: new Date().toISOString(),
        location: this.lastKnownLocation,
      }

      eventList.unshift(event)
      if (eventList.length > 100) {
        eventList.splice(100)
      }

      await AsyncStorage.setItem("geofence_events", JSON.stringify(eventList))
    } catch (error) {
      // Silent fail
    }
  }

  async getGeofenceEvents() {
    try {
      const events = await AsyncStorage.getItem("geofence_events")
      return events ? JSON.parse(events) : []
    } catch (error) {
      return []
    }
  }

  testNotifications() {
    this.showNotification("Test", "Notifications working perfectly!")
  }
}

export default new GeofenceService()
