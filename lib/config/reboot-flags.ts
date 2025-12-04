/**
 * Reboot Motion Integration Feature Flags
 * 
 * These flags control access to Reboot Motion data ingestion and analysis features.
 * All Reboot features are admin/coach-only and do not affect the player experience.
 * 
 * To enable Reboot features:
 * 1. Set REBOOT_SYNC_ENABLED = true
 * 2. Configure REBOOT_API_BASE_URL and REBOOT_API_KEY in .env
 * 3. Navigate to /admin/reboot to sync data
 */

/**
 * Master flag for Reboot Motion integration
 * 
 * When true:
 * - /admin/reboot page is accessible
 * - Sync button appears in admin UI
 * - Reboot athlete linking is available in player detail
 * 
 * When false:
 * - All Reboot UI is hidden
 * - Reboot data is still stored in database but not accessible via UI
 */
export const REBOOT_SYNC_ENABLED = true;

/**
 * Future flags (Phase 2+):
 * 
 * export const REBOOT_COMPARISON_ENABLED = false;  // Compare player to Reboot model
 * export const REBOOT_BENCHMARKING_ENABLED = false; // Show percentile vs MLB/college/HS
 * export const REBOOT_OVERLAY_ENABLED = false;     // Overlay Reboot swing on player video
 */
