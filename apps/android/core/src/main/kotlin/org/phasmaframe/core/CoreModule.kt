package org.phasmaframe.core

/**
 * Skeleton marker for the pure-Kotlin/JVM `:core` module.
 *
 * Domain models, the Protobuf bundle codec (#18), the repository/use-case and import
 * logic (#21), and the transport interface (#20) land here in later feature PRs. This
 * placeholder exists so the module compiles and its unit-test wiring is verifiable on a
 * plain JDK before any Android SDK is present.
 */
object CoreModule {
    const val NAME: String = "phasmaframe-core"
}
