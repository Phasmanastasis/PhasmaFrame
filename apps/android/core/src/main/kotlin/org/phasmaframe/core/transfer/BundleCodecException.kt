package org.phasmaframe.core.transfer

/** Base type for all bundle codec failures. */
sealed class BundleCodecException(message: String, cause: Throwable? = null) :
    Exception(message, cause)

/**
 * The decoded bundle declares a schema version this build does not support. Carries the
 * offending and supported versions so the UI can show a clear message (SDD: reject
 * unknown schema versions).
 */
class UnsupportedSchemaVersionException(
    val foundVersion: Int,
    val supportedVersion: Int,
) : BundleCodecException(
    "Unsupported bundle schema version $foundVersion (this app supports $supportedVersion).",
)

/** The bytes could not be parsed as a TransferBundle (corrupt or not a bundle at all). */
class MalformedBundleException(cause: Throwable) :
    BundleCodecException("Bundle payload is malformed or not a TransferBundle.", cause)
