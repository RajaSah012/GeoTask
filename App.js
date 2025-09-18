import { useState, useEffect } from "react"
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

import HomeScreen from "./src/screens/HomeScreen"
import MapScreen from "./src/screens/MapScreen"
import GeofenceScreen from "./src/screens/GeofenceScreen"
import EventHistoryScreen from "./src/screens/EventHistoryScreen"
import PermissionService from "./src/services/PermissionService"

const App = () => {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    // Request permissions on app start
    const initializeApp = async () => {
      try {
        await PermissionService.requestLocationPermissions()
        await PermissionService.requestNotificationPermissions()
      } catch (error) {
        // Silent error handling
      }
    }

    initializeApp()
  }, [])

  const screens = [
    { name: "Home", component: HomeScreen, icon: "home" },
    { name: "Map", component: MapScreen, icon: "map" },
    { name: "Geofences", component: GeofenceScreen, icon: "list" },
    { name: "Events", component: EventHistoryScreen, icon: "history" },
  ]

  const CurrentScreen = screens[activeTab].component

  // Create a mock navigation object
  const navigation = {
    navigate: (screenName) => {
      try {
        const screenIndex = screens.findIndex((screen) => screen.name === screenName)
        if (screenIndex !== -1) {
          setActiveTab(screenIndex)
        } else {
          Alert.alert("Navigation Error", `Screen "${screenName}" not found.`)
        }
      } catch (error) {
        Alert.alert("Navigation Error", "Failed to navigate to screen.")
      }
    },
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Geofence Monitor</Text>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        <CurrentScreen navigation={navigation} />
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {screens.map((screen, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => {
              try {
                setActiveTab(index)
              } catch (error) {
                Alert.alert("Error", "Failed to switch tab.")
              }
            }}
          >
            <Icon name={screen.icon} size={24} color={activeTab === index ? "#007AFF" : "gray"} />
            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{screen.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#f0f8ff",
  },
  tabText: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
})

export default App
