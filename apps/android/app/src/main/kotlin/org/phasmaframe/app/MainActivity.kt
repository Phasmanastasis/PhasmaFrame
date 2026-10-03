package org.phasmaframe.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Skeleton launcher activity. Real navigation and screens arrive with #23 (nav scaffold)
 * and the per-screen feature PRs (#22/#24/#25). This placeholder exists so the module has
 * a launchable entry point and the Compose toolchain is wired.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Scaffold { innerPadding ->
                        Text(
                            text = "PhasmaFrame — offline hypertension follow-up",
                            modifier = Modifier.padding(innerPadding),
                        )
                    }
                }
            }
        }
    }
}
