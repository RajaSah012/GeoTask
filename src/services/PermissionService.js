import { PermissionsAndroid, Platform, Alert, Linking } from "react-native"
import { request, PERMISSIONS, RESULTS, check } from "react-native-permissions"

class PermissionService {
  async requestLocationPermissions() {
    try {
      if (Platform.OS === "android") {
        return await this.requestAndroidLocationPermissions()
      } else {
        return await this.requestIOSLocationPermissions()
      }
    } catch (error) {
      console.error("Error requesting location permissions:", error)
      return false
    }
  }

  async requestAndroidLocationPermissions() {
    try {
      // Request fine location permission
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location to detect when you enter predefined areas.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      )

      if (fineLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Required", "Location permission is required for geofencing to work properly.", [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ])
        return false
      }

      // Request background location permission (Android 10+)
      if (Platform.Version >= 29) {
        const backgroundLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: "Background Location Permission",
            message: "This app needs background location access to monitor geofences when the app is not active.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          },
        )

        if (backgroundLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Background Location",
            "For best geofencing experience, please allow background location access in settings.",
            [{ text: "OK", style: "default" }],
          )
        }
      }

      return true
    } catch (error) {
      console.error("Android permission error:", error)
      return false
    }
  }

  async requestIOSLocationPermissions() {
    try {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)

      if (result === RESULTS.GRANTED) {
        // Request always location permission for background geofencing
        const alwaysResult = await request(PERMISSIONS.IOS.LOCATION_ALWAYS)

        if (alwaysResult !== RESULTS.GRANTED) {
          Alert.alert(
            "Background Location",
            'For best geofencing experience, please allow "Always" location access in settings.',
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ],
          )
        }

        return true
      } else {
        Alert.alert("Permission Required", "Location permission is required for geofencing to work properly.", [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ])
        return false
      }
    } catch (error) {
      console.error("iOS permission error:", error)
      return false
    }
  }

  async checkLocationPermissions() {
    try {
      if (Platform.OS === "android") {
        const fineLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        const backgroundLocation =
          Platform.Version >= 29
            ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION)
            : true

        return {
          fineLocation,
          backgroundLocation,
          hasAllPermissions: fineLocation && backgroundLocation,
        }
      } else {
        const whenInUse = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        const always = await check(PERMISSIONS.IOS.LOCATION_ALWAYS)

        return {
          whenInUse: whenInUse === RESULTS.GRANTED,
          always: always === RESULTS.GRANTED,
          hasAllPermissions: always === RESULTS.GRANTED,
        }
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
      return { hasAllPermissions: false }
    }
  }

  async requestNotificationPermissions() {
    try {
      if (Platform.OS === "android") {
        // Android handles notification permissions automatically
        return true
      } else {
        // iOS notification permissions are handled by react-native-push-notification
        return true
      }
    } catch (error) {
      console.error("Error requesting notification permissions:", error)
      return false
    }
  }
}

export default new PermissionService()
