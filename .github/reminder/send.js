// Sends the push to the phone. The service worker there writes the words from the list.
const webpush = require('web-push');
const { parseCode } = require('./check');

const code = parseCode(process.env.ORGANIZE_PUSH);
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
const subject = owner ? `https://${owner.toLowerCase()}.github.io/${repo}/` : 'https://github.com/';
const fallback = { title: 'Don’t forget your list', body: 'Open Organize and do the one on top.' };

webpush
  .sendNotification(code.sub, JSON.stringify(fallback), {
    vapidDetails: { subject, publicKey: code.pub, privateKey: code.priv },
    TTL: 4 * 60 * 60,
    urgency: 'high',
  })
  .then((res) => console.log(`Sent. The push service answered ${res.statusCode}.`))
  .catch((err) => {
    console.log(`::error::Push failed: ${err.statusCode || ''} ${err.body || err.message}`);
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('::error::The phone is no longer subscribed. In the app, tap Show the code again and paste the new code into ORGANIZE_PUSH.');
    }
    process.exitCode = 1;
  });
