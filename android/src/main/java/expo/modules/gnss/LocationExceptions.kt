package expo.modules.gnss

import expo.modules.kotlin.exception.CodedException

internal class LocationUnauthorizedException :
        CodedException("Not authorized to use location services")