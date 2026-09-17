# Mobile API testing

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
ALLOW_EMAIL_TEST_LOGIN=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_AUDIENCE=authenticated
```

The API still verifies JWT signature, issuer, audience, expiry, user/session IDs and non-anonymous status. Email login is disabled by default and enabling it in production is rejected. Apple/Google verification is unchanged.

`apps/mobile/.env.local` (only public client configuration):

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:4000/graphql
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
EXPO_PUBLIC_ENABLE_EMAIL_TEST_LOGIN=true
```

API URL by device:

- iOS simulator: `http://localhost:4000/graphql`.
- Android emulator: `http://10.0.2.2:4000/graphql`.
- Physical phone: your Mac's reachable LAN IP, e.g. `http://192.168.0.5:4000/graphql`; same network and permission for local networking required.

Never put an admin/service-role key, password, or access/refresh token in `EXPO_PUBLIC_*`. Sessions are persisted through Keychain; every GraphQL request reads the current token. Logging out or changing users discards the previous user's Relay store.

## Prepare a test account and local table

The SQL preparation below only creates `saved_learning_items` with its FK/unique/index constraints when missing. It is restricted to local `wordseed_dev`, preserves existing tables/data, and does not seed or reset the DB. Existing Dictionary Senses are required.

```bash
node apps/api/scripts/prepare-mobile-test-db.mjs
```

If Supabase email confirmation is enabled, add the project's `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) **only to `apps/api/.env`**. A DB password is not an Auth admin key. The script creates a confirmed test account without sending a confirmation email, and saves randomly generated credentials as `MOBILE_TEST_EMAIL` / `MOBILE_TEST_PASSWORD` in that ignored file. It never prints the password or tokens.

Alternatively, create a confirmed user in Supabase Dashboard → Authentication → Users → Add user and set those two variables yourself; no admin key is needed for an already-created user.

```bash
pnpm --filter @wordseed/api build
node apps/api/scripts/create-mobile-test-account.mjs
```

This signs in against real Supabase, invokes `completeSignIn` to initialize the local DB user, and checks concurrent repeated save, original ID/time preservation, own-list results, missing Sense rejection and unauthenticated rejection. It uses the real API in-process without opening a port. It leaves **one saved Sense** on the test account for inspection. Re-running with the same credentials reuses the account and saved item.

An incomplete run may have created the Supabase user already; credentials are preserved in `.env`. Fix the reported setup problem and rerun; do not reset the DB or regenerate the account unnecessarily. The mobile client never uses the admin key.

## Manual acceptance test

1. Open the native development app and sign in using `MOBILE_TEST_EMAIL` and `MOBILE_TEST_PASSWORD` from `apps/api/.env`.
2. Open **Search**, enter an existing expression (for example `converse`), and submit the search. If it is absent in your data, browse the initial Dictionary results instead.
3. Open a result, select the intended meaning, and tap **이 뜻 저장**. Confirm **저장됨**. Each Sense has its own save action.
4. Open **Library**. Confirm the expression and meaning appear together at the top. Save another Sense and revisit Library to confirm latest-added order.
5. Reopen the original Sense detail and save it again. Confirm Library still has one copy and the original item has not moved above more recently saved items.
6. With over 20 saved Senses, tap **더 보기** and check there are no duplicate rows. Library resets pagination when leaving the screen, so a later visit checks the latest first page.
7. Close/reopen the app to check restored login. Background/foreground it to exercise token refresh. These require the actual native runtime and Supabase session.
8. Log out, then sign in with a second separately-created test account. The first user's collection must not appear.
9. Temporarily make the API unavailable: list/detail should show a retry action; save should show failure rather than **저장됨**. Restore connectivity and retry. Search retry currently resets its search text.

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

Only the current root `App.tsx` reads `EXPO_PUBLIC_*`. A Bare RN entrypoint imports `react-native-url-polyfill/auto`, then renders `src/app/App` with the same `MobileConfiguration` props (`apiUrl`, `supabaseUrl`, `supabasePublishableKey`, `enableEmailTestLogin`). Supply those through your chosen native/build configuration and keep the test flag disabled in release builds. Register the app with `AppRegistry`, autolink native dependencies, install iOS Pods and rebuild. Auth, Relay operations and screen code stay the same.

This change does not perform the Bare RN migration or validate a Bare RN native build.
