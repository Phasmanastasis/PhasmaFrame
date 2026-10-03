package org.phasmaframe.core

import com.google.common.truth.Truth.assertThat
import org.junit.Test

/**
 * Smoke test: proves the `:core` module compiles and its JUnit + Truth test wiring runs
 * on a plain JDK with no Android SDK. Real logic tests arrive with #18/#21.
 */
class CoreModuleTest {
    @Test
    fun moduleNameIsStable() {
        assertThat(CoreModule.NAME).isEqualTo("phasmaframe-core")
    }
}
