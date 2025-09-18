import React, { useState, useRef } from "react"
import { View, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import MapView, { Marker, Circle } from "react-native-maps"
import GeofenceService from "../services/GeofenceService"

const CustomMapView = ({ geofences, onAddGeofence, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef(null)

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    setSelectedLocation({ latitude, longitude })
  }

  const handleAddGeofence = () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Please tap on the map to select a location first.")
      return
    }

    Alert.prompt(
      "Add Geofence",
      "Enter a name for this location:",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setSelectedLocation(null),
        },
        {
          text: "Add",
          onPress: async (name) => {
            if (name && name.trim()) {
              setIsLoading(true)
              try {
                const geofence = {
                  name: name.trim(),
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  radius: 1000, // 1km radius
                }

                await GeofenceService.addGeofence(geofence)
                onAddGeofence && onAddGeofence()
                setSelectedLocation(null)

                Alert.alert("Success", `Geofence "${name}" has been added!`)
              } catch (error) {
                Alert.alert("Error", "Failed to add geofence.")
              } finally {
                setIsLoading(false)
              }
            } else {
              Alert.alert("Error", "Please enter a valid name.")
            }
          },
        },
      ],
      "plain-text",
    )
  }

  // Use mock location if no current location
  const mapLocation = currentLocation || {
    latitude: 37.7749,
    longitude: -122.4194,
  }

  const initialRegion = {
    latitude: mapLocation.latitude,
    longitude: mapLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Current Location Marker */}
        <Marker coordinate={mapLocation} title="Your Location" description="Current position" pinColor="blue" />

        {/* Geofence Markers and Circles */}
        {geofences.map((geofence) => (
          <React.Fragment key={geofence.id}>
            <Marker
              coordinate={{
                latitude: geofence.latitude,
                longitude: geofence.longitude,
              }}
              title={geofence.name}
              description={`Radius: ${geofence.radius}m`}
              pinColor={geofence.isActive ? "red" : "gray"}
            />
            <Circle
              center={{
                latitude: geofence.latitude,
                longitude: geofence.longitude,
              }}
              radius={geofence.radius}
              strokeColor={geofence.isActive ? "rgba(255, 0, 0, 0.5)" : "rgba(128, 128, 128, 0.5)"}
              fillColor={geofence.isActive ? "rgba(255, 0, 0, 0.1)" : "rgba(128, 128, 128, 0.1)"}
              strokeWidth={2}
            />
          </React.Fragment>
        ))}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="New Geofence"
            description="Tap 'Add Geofence' to create"
            pinColor="green"
          />
        )}
      </MapView>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {selectedLocation && (
          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.disabledButton]}
            onPress={handleAddGeofence}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Add Geofence</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions */}
      {!selectedLocation && geofences.length === 0 && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>Tap anywhere on the map to add a geofence location</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    gap: 10,
  },
  addButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  instructions: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
})

export default CustomMapView
