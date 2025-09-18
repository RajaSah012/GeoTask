import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Switch } from "react-native"
import GeofenceService from "../services/GeofenceService"

const GeofenceList = ({ geofences, onUpdate }) => {
  const handleToggleGeofence = async (geofence) => {
    try {
      await GeofenceService.updateGeofence(geofence.id, {
        isActive: !geofence.isActive,
      })
      onUpdate && onUpdate()
    } catch (error) {
      Alert.alert("Error", "Failed to update geofence status.")
    }
  }

  const handleDeleteGeofence = (geofence) => {
    Alert.alert("Delete Geofence", `Are you sure you want to delete "${geofence.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await GeofenceService.removeGeofence(geofence.id)
            onUpdate && onUpdate()
          } catch (error) {
            Alert.alert("Error", "Failed to delete geofence.")
          }
        },
      },
    ])
  }

  const formatDistance = (radius) => {
    if (radius >= 1000) {
      return `${(radius / 1000).toFixed(1)}km`
    }
    return `${radius}m`
  }

  const renderGeofenceItem = ({ item }) => (
    <View style={styles.geofenceItem}>
      <View style={styles.geofenceHeader}>
        <View style={styles.geofenceInfo}>
          <Text style={styles.geofenceName}>{item.name}</Text>
          <Text style={styles.geofenceDetails}>
            📍 {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </Text>
          <Text style={styles.geofenceRadius}>🔄 Radius: {formatDistance(item.radius)}</Text>
          <Text style={styles.geofenceDate}>📅 Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.geofenceControls}>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleGeofence(item)}
            trackColor={{ false: "#767577", true: "#34C759" }}
            thumbColor={item.isActive ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.geofenceActions}>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteGeofence(item)}>
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>

        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
            {item.isActive ? "✅ Active" : "⏸️ Inactive"}
          </Text>
        </View>
      </View>
    </View>
  )

  if (geofences.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📍 No geofences created yet</Text>
        <Text style={styles.emptySubtext}>Tap on the map to add your first geofence location</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Geofences ({geofences.length})</Text>
      <FlatList
        data={geofences}
        keyExtractor={(item) => item.id}
        renderItem={renderGeofenceItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listContainer: {
    padding: 16,
  },
  geofenceItem: {
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
  geofenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  geofenceInfo: {
    flex: 1,
  },
  geofenceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  geofenceDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  geofenceRadius: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  geofenceDate: {
    fontSize: 12,
    color: "#666",
  },
  geofenceControls: {
    alignItems: "center",
  },
  geofenceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: "#E8F5E8",
  },
  inactiveBadge: {
    backgroundColor: "#F5F5F5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeText: {
    color: "#34C759",
  },
  inactiveText: {
    color: "#8E8E93",
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

export default GeofenceList
