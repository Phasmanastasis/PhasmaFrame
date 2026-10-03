import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// :core — pure Kotlin/JVM module. NO Android dependencies.
// Holds domain models, the Protobuf schema + bundle codec (#18), repository/use-case +
// import logic (#21), transport interfaces (#20), and validation. Because it is
// Android-free, it compiles and unit-tests on a plain JDK (17 or 21), no Android SDK.
//
// Bytecode targets Java 17; compilation runs on whatever JDK runs Gradle (17 or 21).
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.protobuf)
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
    // protobuf-javalite runs on a plain JVM as well as Android, so the generated code and
    // codec are unit-testable here without the Android SDK.
    implementation(libs.protobuf.javalite)

    testImplementation(libs.junit)
    testImplementation(libs.truth)
    testImplementation(libs.kotlinx.coroutines.test)
}

protobuf {
    protoc {
        artifact = libs.protobuf.protoc.get().toString()
    }
    generateProtoTasks {
        all().forEach { task ->
            task.builtins {
                // The plugin registers a default "java" builtin; configure it for the
                // lite runtime (matches protobuf-javalite) rather than adding a new one.
                named("java") {
                    option("lite")
                }
            }
        }
    }
}

tasks.withType<Test> {
    useJUnit()
}
