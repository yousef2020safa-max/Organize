# Organize

A dark, green-accented to-do list for the iPhone home screen. The top of the screen counts down the days to Jan 1 in giant type, with a bar showing how much of the year is gone. Below that, the task on top sits in a big black card with Done and Later buttons, the headline counts what's left, and anything older than three days turns red. Once it's on your home screen you can turn on the badge, and the icon shows the number of open tasks.

Under the countdown is an "every day" checklist that empties at midnight: journal, workout, prayer (five boxes, F D A M I for Fajr, Dhuhr, Asr, Maghrib and Isha), that, chronometer and work. The headline count and the icon badge include whatever's left of it.

Tasks are saved on the phone (localStorage). No account, no server.

## Put it on your phone

1. Turn on GitHub Pages: repo Settings, then Pages. Under Build and deployment pick "Deploy from a branch", choose the branch this code is on and the `/ (root)` folder, and save.
2. After a minute it's live at https://yousef2020safa-max.github.io/Organize/
3. Open that link in Safari, tap Share, then Add to Home Screen.
4. Open Organize from the icon and tap "Turn on the badge" at the bottom.

Add tasks from the home screen app, not from Safari. iOS keeps the two separate.

## The 6 pm reminder

Every evening at 6 pm Florida time you get a notification like "Don't forget: 5 to do. Left today: workout, prayer (3/5). Next up: Finish the bio lab report draft. 91 days left until Jan 1." GitHub only sends the ping. The phone writes the words from your list, so your tasks never leave it.

1. In the home screen app, scroll down to Reminders and tap Turn on reminders. Allow notifications.
2. Tap Copy code, then open the link in step 2. Name the secret `ORGANIZE_PUSH`, paste the code and tap Add secret.
3. To test it, open the Actions tab, pick Daily reminder and tap Run workflow. It sends one right away.

The workflow (`.github/workflows/reminder.yml`) runs from `main` once an hour and only sends during the hour set in `REMIND_HOUR` (24-hour clock) in the `REMIND_TZ` time zone, which is set to Florida (Eastern). Change those to move the reminder. The workflow also makes a small commit every 45 days or so, because GitHub pauses scheduled jobs in public repos after 60 days without commits.

## Files

- `index.html` is the whole app: markup, styles and script.
- `sw.js` caches the app so it opens offline and shows the reminder when the push arrives.
- `.github/reminder/` has the scripts the workflow runs.
- `manifest.webmanifest` and `icons/` give it its name and icon on the home screen.

The app checks for a new version every time it opens with a connection, so pushed changes show up on the phone without reinstalling.
