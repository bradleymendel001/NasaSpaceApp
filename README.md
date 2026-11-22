# NASA Space Explorer

A React Native (Expo) app in JavaScript. It shows NASA's Astronomy Picture of the Day, lets you browse random pictures from the archive, and saves your favorites to a Firebase database.

## How each requirement is met

| # | Requirement | Where |
|---|---|---|
| 1 | Multiple screens, bottom tab navigation | `App.js` (Today, Explore, Favorites tabs) |
| 2 | A Firebase database | `src/services/firebase.js`, plus the setup steps below |
| 3 | A free API key from an organization | NASA key in `src/config.js` (from api.nasa.gov) |
| 4 | Network requests to an external API | `src/services/nasaApi.js` (`fetch` to NASA APOD) |
| 5 | Create, read and delete in my database | `src/services/favoritesDb.js` (`addDoc`, `getDocs`, `deleteDoc`) |
| 6 | Local copies of the data | `src/storage/localCache.js` (AsyncStorage) and React state in `FavoritesContext.js` |
| 7 | Remote and local copies stay in sync | `src/context/FavoritesContext.js` (see the comment at the top) |
| 8 | `useEffect()` loads data when a screen first opens | `TodayScreen.js`, `ExploreScreen.js`, `FavoritesContext.js` |

## File structure

```
App.js                          Tab navigator, the root of the app
src/
  config.js                     NASA key + Firebase config (edit this)
  theme.js                      Colors
  services/
    nasaApi.js                  Talks to NASA (external API)
    firebase.js                 Connects to your Firebase project
    favoritesDb.js              Create / read / delete favorites in Firestore
  storage/
    localCache.js               Saves data on the phone (AsyncStorage)
  context/
    FavoritesContext.js         Shared favorites list + sync logic
  components/
    ApodCard.js                 One picture card with a button
    StatusMessage.js            Loading spinner / message
  screens/
    TodayScreen.js              Tab 1: today's picture
    ExploreScreen.js            Tab 2: 10 random pictures
    FavoritesScreen.js          Tab 3: your saved pictures
```

## Create the Firebase database (one time, about 5 minutes)

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Create a project**, give it a name (for example `nasa-space-app`), and finish the wizard. You can turn Google Analytics off.
3. In the left menu, open **Build → Firestore Database** and click **Create database**.
   - Pick any location.
   - Choose **Start in test mode**. This lets the app read and write without logging in. Test mode expires after 30 days; that's fine for a class project.
4. Click the **gear icon → Project settings**. Under **Your apps**, click the **`</>`** (Web) icon, give it a nickname, and click **Register app**. You don't need Firebase Hosting.
5. Firebase shows a `firebaseConfig = { ... }` block. Copy those six values into `firebaseConfig` in `src/config.js`.

You don't have to create the `favorites` collection yourself. Firestore creates it the first time you save a picture.

## Run the app

```bash
npm install
npx expo start
```

Then press `i` for the iOS Simulator, or scan the QR code with the **Expo Go** app on your phone.

## How the local/remote sync works

- **When the app starts**, the favorites list saved on the phone appears right away. The app then downloads the real list from Firebase and replaces the saved one.
- **When you save or delete**, the change goes to Firebase first. The list on the screen (and on the phone) only changes after Firebase confirms. If the request fails, nothing changes locally and an error message appears, so the two copies never disagree.
- **When you pull down** on the Favorites tab, the app downloads the list from Firebase again. This picks up changes made somewhere else, such as deleting a document in the Firebase console.
- **Checks like "is this already saved?"** and the badge on the Favorites tab use the local list, so they never need a network request.
- **NASA pictures are cached on the phone too.** A day's picture never changes, so it's downloaded once. The Explore batch is kept until you pull down for a new one.

## Testing it

1. Save a picture on **Today**. Its button changes to "Saved ✓" and the Favorites badge shows 1.
2. Open the Firebase console under **Firestore Database → favorites**. The new document is there.
3. Delete it on the **Favorites** tab. It disappears from the console too.
4. Delete a document in the console, then pull down on the Favorites tab. The app catches up.
