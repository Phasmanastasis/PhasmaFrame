import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// :core — pure Kotlin/JVM module. NO Android dependencies.
// Holds domain models, the Protobuf bundle codec (#18), repository/use-case + import
// logic (#21), transport interfaces (#20), and validation. Because it is Android-free,
// it compiles and unit-tests on a plain JDK (no Android SDK required).
//
// Bytecode targets Java 17 (compatible with the Android app module). Compilation runs on
// whatever JDK runs Gradle (JDK 17 or 21). We intentionally do not pin a strict Gradle
// Java toolchain so the module builds against the locally installed JDK without requiring
// a toolchain auto-download.
plugins {
    alias(libs.plugins.kotlin.jvm)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(libs.kotlinx.coroutines.core)

    testImplementation(libs.junit)
    testImplementation(libs.truth)
    testImplementation(libs.kotlinx.coroutines.test)
}

tasks.withType<Test> {
    useJUnit()
}
