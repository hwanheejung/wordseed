# Mobile API testing

See [Mobile Authentication Strategy](../../docs/architecture/mobile-authentication.md) for authentication ownership and Mermaid flow diagrams.

The mobile client uses the real Dictionary and saved-item GraphQL operations. Search and Library are connected; Home remains a UI preview. Only saving an existing Sense and reading the current user's collection are implemented.

## Runtime and native build

Use Node 22.20+ and the workspace's pnpm version. Authentication uses Supabase and `react-native-keychain` (iOS Keychain / Android Keystore). **Expo Go cannot load this native module.** Use a native development build:

```bash
# From the repository root, in separate terminals:
pnpm dev:api
pnpm --filter @wordseed/mobile ios:native
# Or:
pnpm --filter @wordseed/mobile android:native
```

Xcode / Android SDK must already be configured. The first native build may ask for the app identifier. After the first build, start Metro with `pnpm dev:mobile` and open the installed development app. Do not open the project in Expo Go.

Restart an already-running API after changing its `.env`. Restart Metro after changing the mobile `.env.local`.

## Missing native Keychain module

`getGenericPasswordForOptions of null` means the installed app binary does not contain RNKeychainManager. Expo Go and a build from before Keychain was added cannot use this adapter. Reloading JavaScript or restarting Metro cannot install native code.

Run `pnpm --filter @wordseed/mobile ios:native` (or `android:native`) to build and launch the native app. `ios` and `android` also build the native app. For a physical iPhone, use `pnpm --filter @wordseed/mobile exec expo run:ios --device`. If Metro is already running, keep using its port when prompted. Avoid opening the Expo Go QR code. In an existing Bare RN iOS project, install Pods and rebuild.

The session gate checks native availability before constructing Supabase or starting refresh; missing-module builds display an actionable message.

## Environment

`apps/api/.env`:

```dotenv
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_AUDIENCE=authenticated
```

The API verifies JWT signature, issuer, audience, expiry, user/session IDs and non-anonymous status, and requires an Apple or Google identity. Email-only identities are rejected; linked email identities do not disqualify a social account.

`apps/mobile/.env.local` (only public client configuration):

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:4000/graphql
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

API URL by device:

- iOS simulator: `http://localhost:4000/graphql`.
- Android emulator: `http://10.0.2.2:4000/graphql`.
- Physical phone: your Mac's reachable LAN IP, e.g. `http://192.168.0.5:4000/graphql`; same network and permission for local networking required.

Never put an admin/service-role key, password, or access/refresh token in `EXPO_PUBLIC_*`. Sessions are persisted through Keychain; every GraphQL request reads the current token. Logging out or changing users discards the previous user's Relay store.

## Social login and persistent sessions

Enable Google and Apple in Supabase Authentication → Providers. Register the Supabase project's `/auth/v1/callback` URL in each provider console. Configure Google's OAuth client and Apple's Services ID, team/key IDs and signing secret in Supabase, never in the app. Apple browser OAuth requires periodic client-secret renewal (at most six months).

Add the exact `wordseed://auth/callback` URL to Supabase Authentication → URL Configuration → Redirect URLs. The app uses `expo-web-browser` for both providers, PKCE with secure random values/SHA-256, and Keychain for persisted sessions and PKCE verification material. Native URL scheme changes require rebuilding; the local generated iOS project must include `wordseed` in CFBundleURLSchemes. Fresh Prebuild generates it from app.json. Avoid destructive clean prebuild when native customizations exist.

In Supabase session settings, leave time-boxed sessions and inactivity timeout disabled (0/unlimited), and single-session enforcement off. Access tokens keep their normal short expiry; the SDK rotates refresh tokens indefinitely while the session remains valid. The app adds no lifetime timer. Logout/revocation still ends a session. Provider settings and session limits are server configuration, not changed by mobile code.

Startup restores secure storage; AppState starts refresh while active and stops it in background. Every authenticated request asks the SDK for a current session (including expiry refresh), and rejects expired or switched-user tokens. Temporary connection failures do not explicitly delete persisted credentials. Logging out unmounts the user's Relay store.

## Prepare the local table

The SQL preparation below only creates `saved_learning_items` with its FK/unique/index constraints when missing. It is restricted to local `wordseed_dev`, preserves existing tables/data, and does not seed or reset the DB. Existing Dictionary Senses are required.

```bash
node apps/api/scripts/prepare-mobile-test-db.mjs
```

Use real Apple/Google accounts for device testing. Existing email-only test users and saved data are not deleted; they are no longer an accepted sign-in method.

## Manual acceptance test

1. Open the native development app and sign in with Apple or Google. Check provider cancellation returns to the login buttons. Verify both providers separately.
2. Open **Search**, enter an existing expression (for example `converse`), and submit the search. If it is absent in your data, browse the initial Dictionary results instead.
3. Open a result, select the intended meaning, and tap the save-meaning button. Confirm the saved state. Each Sense has its own save action.
4. Open **Library**. Confirm the expression and meaning appear together at the top. Save another Sense and revisit Library to confirm latest-added order.
5. Reopen the original Sense detail and save it again. Confirm Library still has one copy and the original item has not moved above more recently saved items.
6. With over 20 saved Senses, tap the load-more button and check there are no duplicate rows. Library resets pagination when leaving the screen, so a later visit checks the latest first page.
7. Close/reopen the app to check restored login. Background/foreground it to exercise token refresh. These require the actual native runtime and Supabase session.
8. Log out, then sign in with a second separately-created test account. The first user's collection must not appear.
9. Temporarily make the API unavailable: list/detail should show a retry action; save should show failure rather than a saved state. Restore connectivity and retry. Search retry currently resets its search text.

## Automated checks

```bash
pnpm --filter @wordseed/mobile relay
pnpm --filter @wordseed/mobile typecheck
pnpm --filter @wordseed/mobile test
pnpm --filter @wordseed/api typecheck
pnpm --filter @wordseed/api lint
pnpm --filter @wordseed/api test
```

Mobile unit tests mock native storage/auth/network boundaries; they do not prove device Keychain, keyboard/layout, or background behavior. The mobile package currently has no lint script. Generated Relay artifacts must come from the compiler, never manual edits.

## Moving to Bare React Native

`src/shared/auth` uses the Supabase SDK and `react-native-keychain`; `src/shared/relay` accepts an API URL and token getter. Session lifecycle uses React Native `AppState`. None of these import Expo.

Only the current root `App.tsx` reads `EXPO_PUBLIC_*`. Expo browser and PKCE crypto bridges live in `src/app/native-auth`. A Bare RN entrypoint installs secure WebCrypto support and `react-native-url-polyfill/auto`, then renders `src/app/App` with the same `MobileConfiguration` props (`apiUrl`, `supabaseUrl`, `supabasePublishableKey`, `oauthBrowser`). Keep Expo modules or supply another OAuthBrowser implementation. Register the app with AppRegistry, configure the wordseed URL scheme and cold-launch Linking delivery, autolink dependencies, install Pods and rebuild. Session and sign-in feature code remain unchanged.

This change does not perform the Bare RN migration or validate a Bare RN native build.
