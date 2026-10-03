package org.phasmaframe.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.phasmaframe.app.ui.PhasmaFrameNavHost

/**
 * Launcher activity. Hosts the Compose navigation graph (#23). Per-screen content is
 * filled in by the feature PRs (#22/#24/#25).
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { PhasmaFrameApp() }
    }
}

@Composable
private fun PhasmaFrameApp() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            PhasmaFrameNavHost()
        }
    }
}
