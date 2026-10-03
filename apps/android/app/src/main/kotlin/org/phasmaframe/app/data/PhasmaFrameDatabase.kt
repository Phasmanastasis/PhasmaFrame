package org.phasmaframe.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import org.phasmaframe.app.data.dao.BloodPressureReadingDao
import org.phasmaframe.app.data.dao.PatientDao
import org.phasmaframe.app.data.dao.VisitNoteDao
import org.phasmaframe.app.data.entity.BloodPressureReadingEntity
import org.phasmaframe.app.data.entity.PatientEntity
import org.phasmaframe.app.data.entity.VisitNoteEntity

/**
 * The app's offline Room/SQLite database.
 *
 * Append-only semantics are enforced at the DAO layer (inserts IGNORE existing ids),
 * which supports repeat-safe import (#21) and never overwrites existing readings/notes.
 *
 * `exportSchema = true` writes versioned schema JSON to `app/schemas/` so future
 * migrations can be validated against a known baseline.
 */
@Database(
    entities = [
        PatientEntity::class,
        BloodPressureReadingEntity::class,
        VisitNoteEntity::class,
    ],
    version = 1,
    exportSchema = true,
)
abstract class PhasmaFrameDatabase : RoomDatabase() {

    abstract fun patientDao(): PatientDao
    abstract fun bloodPressureReadingDao(): BloodPressureReadingDao
    abstract fun visitNoteDao(): VisitNoteDao

    companion object {
        const val DATABASE_NAME = "phasmaframe.db"

        /**
         * Registered database migrations. Empty at version 1. When bumping `version`,
         * add a `Migration(from, to)` here instead of relying on destructive fallback,
         * so existing readings survive upgrades (PRD measure 1: data persists).
         *
         * Example skeleton for the first real migration:
         * ```
         * val MIGRATION_1_2 = object : Migration(1, 2) {
         *     override fun migrate(db: SupportSQLiteDatabase) {
         *         db.execSQL("ALTER TABLE blood_pressure_reading ADD COLUMN unit TEXT")
         *     }
         * }
         * ```
         */
        val MIGRATIONS: Array<Migration> = emptyArray()

        @Volatile
        private var instance: PhasmaFrameDatabase? = null

        fun get(context: Context): PhasmaFrameDatabase =
            instance ?: synchronized(this) {
                instance ?: build(context).also { instance = it }
            }

        private fun build(context: Context): PhasmaFrameDatabase =
            Room.databaseBuilder(
                context.applicationContext,
                PhasmaFrameDatabase::class.java,
                DATABASE_NAME,
            )
                .addMigrations(*MIGRATIONS)
                // No fallbackToDestructiveMigration: readings must survive upgrades.
                .build()
    }
}
