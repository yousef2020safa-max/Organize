// Runs every hour from the Daily reminder workflow. Decides whether this run sends the reminder
// (it's REMIND_HOUR in the phone's time zone, or someone pressed Run workflow) and whether the
// schedule needs a keepalive commit so GitHub doesn't pause it after 60 quiet days.
const fs = require('fs');
const { execSync } = require('child_process');

// The code from the app is base64 JSON: { sub, pub, priv, tz }. Plain JSON works too.
function parseCode(raw) {
  if (!raw) return null;
  const text = raw.trim();
  const attempts = [() => JSON.parse(Buffer.from(text, 'base64').toString('utf8')), () => JSON.parse(text)];
  for (const attempt of attempts) {
    try {
      const code = attempt();
      if (code && code.sub && code.sub.endpoint && code.pub && code.priv) return code;
    } catch (e) {}
  }
  return null;
}

function localHour(date, timeZone) {
  try {
    return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date));
  } catch (e) {
    return date.getUTCHours();
  }
}

function main() {
  const out = (key, value) => fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  const force = process.env.FORCE === 'true';
  const remindHour = Number(process.env.REMIND_HOUR || 18);

  const lastCommit = Number(execSync('git log -1 --format=%ct').toString().trim()) * 1000;
  out('keepalive', Date.now() - lastCommit > 45 * 86400000);

  const code = parseCode(process.env.ORGANIZE_PUSH);
  if (!code) {
    console.log('No reminder code yet. In the app, tap Turn on reminders and paste the code into the ORGANIZE_PUSH secret.');
    if (force) {
      console.log('::error::The ORGANIZE_PUSH secret is missing or is not a code from the app.');
      process.exitCode = 1;
    }
    out('send', false);
    return;
  }

  const hour = localHour(new Date(), code.tz);
  const send = force || hour === remindHour;
  console.log(`It's ${hour}:xx in ${code.tz || 'UTC'} and the reminder goes out at ${remindHour}:xx. ${send ? 'Sending.' : 'Not sending.'}`);
  out('send', send);
}

if (require.main === module) main();
module.exports = { parseCode, localHour };
