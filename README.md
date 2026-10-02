# Organize

A to-do list for the iPhone home screen. The top of the screen counts down the days to Jan 1 in giant type, with a bar showing how much of the year is gone. Below that, the task on top sits in a big black card with Done and Later buttons, the headline counts what's left, and anything older than three days turns red. Once it's on your home screen you can turn on the badge, and the icon shows the number of open tasks.

Tasks are saved on the phone (localStorage). No account, no server.

## Put it on your phone

1. Turn on GitHub Pages: repo Settings, then Pages. Under Build and deployment pick "Deploy from a branch", choose the branch this code is on and the `/ (root)` folder, and save.
2. After a minute it's live at https://yousef2020safa-max.github.io/Organize/
3. Open that link in Safari, tap Share, then Add to Home Screen.
4. Open Organize from the icon and tap "Turn on the badge" at the bottom.

Add tasks from the home screen app, not from Safari. iOS keeps the two separate.

## Files

- `index.html` is the whole app: markup, styles and script.
- `sw.js` caches the app so it opens offline.
- `manifest.webmanifest` and `icons/` give it its name and icon on the home screen.

The app checks for a new version every time it opens with a connection, so pushed changes show up on the phone without reinstalling.
