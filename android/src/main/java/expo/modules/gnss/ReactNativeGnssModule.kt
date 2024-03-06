package expo.modules.gnss

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.location.LocationManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.Exceptions
import android.location.GnssStatus
import android.os.Bundle
import android.util.Log
import androidx.core.os.bundleOf

private const val TAG = "ReactNative"

class ReactNativeGnssModule : Module() {
  private var mGnssStatusCallback : GnssStatus.Callback? = null
  private lateinit var mLocationManager: LocationManager
  private lateinit var mContext: Context

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  @SuppressLint("MissingPermission")
  override fun definition() = ModuleDefinition {
    fun startWatchingSatellites() {
      // Only register once
      if (mGnssStatusCallback != null) return
      // Check for permissions
      if (isMissingForegroundPermissions()) return


      mGnssStatusCallback = object : GnssStatus.Callback() {
        override fun onStarted() {
          sendEvent("started")
          super.onStarted()
        }

        override fun onSatelliteStatusChanged(status: GnssStatus) {
          val satellites = List(status.satelliteCount) { i ->
            bundleOf(
              "svid" to status.getSvid(i),
              "constellationType" to status.getConstellationType(i),
              "elevationDegrees" to status.getElevationDegrees(i),
              "azimuthDegrees" to status.getAzimuthDegrees(i),
              "usedInFix" to status.usedInFix(i)
            )
          }
          sendEvent("satellites", bundleOf("satellites" to satellites))
          super.onSatelliteStatusChanged(status)
        }

        override fun onStopped() {
          sendEvent("stopped")
          super.onStopped()
        }

        override fun onFirstFix(ttffMillis: Int) {
          sendEvent("first-fix", bundleOf("ttffMillis" to ttffMillis))
          super.onFirstFix(ttffMillis)
        }
      }

      mGnssStatusCallback?.let {
        mLocationManager.registerGnssStatusCallback(it, null)
      }
    }

    fun stopWatchingSatellites() {
      mGnssStatusCallback?.let {
        mLocationManager.unregisterGnssStatusCallback(it)
      }
      mGnssStatusCallback = null
    }

    OnCreate {
      mContext = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      mLocationManager = mContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    OnStartObserving {
      // If the user has not given location permissions at this stage, this will be a no-op,
      // then OnEntersForeground will be called when the user gives permissions.
      startWatchingSatellites()
    }

    OnStopObserving {
      stopWatchingSatellites()
    }

    OnActivityEntersForeground {
      // Check if we need to start the watch after the app comes back to the foreground,
      // which happens after the user gives permissions.
      startWatchingSatellites()
    }

    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeGnss')` in JavaScript.
    Name("ReactNativeGnss")

    // Defines event names that the module can send to JavaScript.
    Events("started", "stopped", "first-fix", "satellites")
  }

  /**
   * Checks whether all required permissions have been granted by the user.
   */
  private fun isMissingForegroundPermissions(): Boolean {
    appContext.permissions?.let {
      val canAccessFineLocation = it.hasGrantedPermissions(Manifest.permission.ACCESS_FINE_LOCATION)
      val canAccessCoarseLocation = it.hasGrantedPermissions(Manifest.permission.ACCESS_COARSE_LOCATION)
      return !canAccessFineLocation && !canAccessCoarseLocation
    } ?: throw Exceptions.AppContextLost()
  }
}
