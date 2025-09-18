import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from "react-native"
import GeofenceService from "../services/GeofenceService"
import AsyncStorage from "@react-native-async-storage/async-storage"

const EventHistoryScreen = () => {
  const [events, setEvents] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const loadedEvents = await GeofenceService.getGeofenceEvents()
      setEvents(loadedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
  }

  const clearHistory = () => {
    Alert.alert("Clear History", "Are you sure you want to clear all event history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("geofence_events")
            setEvents([])
          } catch (error) {
            Alert.alert("Error", "Failed to clear history.")
          }
        },
      },
    ])
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getEventIcon = (type) => {
    return type === "entry" ? "🟢" : "🔴"
  }

  const getEventText = (type) => {
    return type === "entry" ? "Entered" : "Exited"
  }

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>
            {getEventIcon(item.type)} {getEventText(item.type)} {item.geofenceName}
          </Text>
          <Text style={styles.eventTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={styles.eventDistance}>
          <Text style={styles.distanceText}>{item.distance}m</Text>
        </View>
      </View>

      {item.location && (
        <Text style={styles.eventLocation}>
          📍 {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
        </Text>
      )}
    </View>
  )

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📊 No events recorded yet</Text>
        <Text style={styles.emptySubtext}>Events will appear here when you enter or exit geofenced areas</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Event History ({events.length})</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
  },
  eventItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: "#666",
  },
  eventDistance: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  eventLocation: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
})

export default EventHistoryScreen
