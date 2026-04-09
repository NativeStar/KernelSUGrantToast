plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.suisho.kernelsugranttoast"
    compileSdk {
        version = release(36) {
        }
    }

    defaultConfig {
        applicationId = "com.suisho.kernelsugranttoast"
        minSdk = 31
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
//        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        externalNativeBuild {
            cmake {
                cppFlags += "";
                abiFilters += "arm64-v8a"
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }
    ndkVersion = "28.0.13004108"
    packaging {
        jniLibs {
            useLegacyPackaging = true
        }
        resources {
            excludes += "kotlin/**"
        }
    }
}

dependencies {
    implementation(libs.hiddenapibypass)
}

configurations.configureEach {
    exclude(group = "org.jetbrains.kotlin")
    exclude(group = "org.jetbrains", module = "annotations")
}
