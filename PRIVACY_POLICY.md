# Privacy Policy

**Effective Date:** March 1, 2026
**Last Updated:** October 18, 2026
**Version:** 1.1

RunStrict ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use RunStrict.

---

## 1. Information We Collect

### 1.1 Account Information
- Display name (username)
- Biological sex (used for community statistics)
- Date of birth (for age verification and statistics)
- Nationality (ISO country code, optional)
- Team affiliation (FLAME, WAVE, or CHAOS)
- Personal manifesto (up to 30 characters, optional, publicly visible)
- OAuth identity from Apple or Google (email, profile photo)
- Optional public profile photo and social profile URL (editable or removable)

### 1.2 Location Data
- **GPS coordinates:** Collected continuously ONLY during active running sessions
- **Route path:** The sequence of H3 hexagonal coordinates you traverse during a run
- Accuracy readings and heading data (for anti-spoofing validation)
- **Home hex:** The general neighborhood area from which you typically run (city-level precision, H3 resolution 6, ~3.2km diameter)

### 1.3 Running Performance Data
- Distance, duration, and pace of each run
- Hex territories captured (flip count)
- Coefficient of Variation (CV) for pace consistency
- Per-run territory breakdown and server-confirmed scoring adjustments
- Flip points earned per run
- Average and maximum heart rate when supplied by a connected watch

### 1.4 Device Data
- Accelerometer readings (for anti-spoofing validation only; **not stored**)
- Device locale and timezone
- App version and platform
- Advertising identifiers, ad interactions and SDK diagnostics, as described below

---

## 2. How We Use Your Information

We use your information to:

- Provide and operate the RunStrict game service
- Calculate your running performance, flip points, and leaderboard ranking
- Determine territory capture (hex flips) during runs
- Apply team scoring rules and publish cooperative season contributions
- Prevent cheating and maintain competitive fairness
- Improve the Service and develop new features
- Send in-app notifications about game events

---

## 3. Hex Territory Privacy

RunStrict is designed with privacy in mind regarding territory data:

- Public territory data shows team colors and aggregate game results
- Server-only ownership attributes may associate a hex with a runner for aggregate awards; direct client access to those attributes is blocked
- Individual capture timestamps are not published with runner identity
- Other players can see team territory and published regional winners; raw ownership rows and individual capture times are not public
- Your home hex is stored at city-district level precision (H3 resolution 6, ~3.2km diameter) — not your exact address

---

## 4. Data Sharing and Disclosure

### 4.1 Public Information
The following is visible to other RunStrict users:
- Username, team, manifesto, optional photo and social profile URL
- Opt-in cooperation membership, coarse registered-home region, published contributions and nationality when enabled
- Season flip points and ranking
- Total distance and pace statistics (aggregated)
- General neighborhood (home hex end location)

### 4.2 Third-Party Service Providers
We share data with:
- **Supabase:** Hosts our database. Your profile and run data is stored on Supabase infrastructure.
- **Mapbox:** Renders maps and processes location, SDK identifiers, usage and diagnostics for map functionality and analytics.
- **Apple / Google:** Provide authentication. Identity providers process account and device information to authenticate you; we receive the authorized identity information needed for your account.
- **Google AdMob:** Displays ads. Its SDK may collect and share advertising/device identifiers, approximate location derived from IP addresses, ad interactions, usage and diagnostics for advertising, analytics and fraud prevention. iOS tracking authorization and platform advertising controls govern available advertising identifiers. We do not send profile photos, social URLs, running routes or heart-rate records to AdMob for advertising.

### 4.3 Legal Requirements
We may disclose your information if required by law or in response to valid legal process.

### 4.4 No Sale of Data
We do not sell, rent, or trade your personal information to third parties for their marketing purposes.

---

## 5. Data Retention

**5.1 Season Data.** Season scores, team assignments and buff statistics reset at the end of each 40-day season. Territory data persists. Shared artwork is retained in seasonal albums.

**5.2 Run History.** Your personal running history (distance, pace, runs completed) is preserved across seasons — it is stored locally on your device and is never deleted by season resets. Phone growth evidence is also stored locally. Standalone Watch growth and cross-device growth backup are not currently supported.

**5.3 Account Data.** Profile information is retained until you delete your account. Account erasure removes public profile information and owned photos. Retained game records and shared artwork are anonymized to preserve other participants' season results; anonymous coarse regional anchors remain. Deletion requests are completed within 30 days.

**5.4 Legal Holds.** We may retain certain data longer if required by applicable law.

---

## 6. Local Storage

RunStrict stores data locally on your device:
- **SQLite database:** Run history, lap records, route data, crash recovery checkpoints
- **JSON file:** Your cached user profile
- **App preferences:** Mute settings, app configuration

This data remains on your device and is not accessible to us unless you explicitly sync it. Uninstalling the app will delete this local data.

---

## 7. Children's Privacy

RunStrict is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at esther.runstrict@gmail.com. If we become aware that a child under 13 has provided personal information, we will delete it promptly.

---

## 8. Security

We implement industry-standard security measures including:

- Row-Level Security (RLS) on all database tables
- Authentication via established OAuth providers (Apple, Google)
- Encrypted data transmission (HTTPS/TLS)
- Server-side validation of all scoring data

No method of transmission or storage is 100% secure. We cannot guarantee absolute security of your information.

---

## 9. Your Rights

Depending on your jurisdiction, you may have rights to:

- **Access:** Request a copy of your personal data
- **Correction:** Request correction of inaccurate data
- **Deletion:** Request deletion of your account and associated data
- **Portability:** Request your data in a machine-readable format
- **Objection:** Object to certain processing of your data

To exercise these rights, contact us at esther.runstrict@gmail.com.

---

## 10. International Data Transfers

Your data may be processed and stored in countries other than your own. We use Supabase infrastructure which may store data in multiple regions. By using RunStrict, you consent to such transfers.

---

## 11. Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of significant changes via the app. The "Effective Date" at the top of this document reflects the most recent revision.

---

## 12. Contact Us

If you have questions or concerns about this Privacy Policy or our data practices:

**Email:** esther.runstrict@gmail.com

RunStrict — *"Run. Conquer. Reset."*
