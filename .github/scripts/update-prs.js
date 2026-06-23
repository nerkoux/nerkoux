const { execSync } = require('child_process');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;
const username = 'nerkoux';

async function main() {
  const response = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=created&order=desc&per_page=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  const data = await response.json();

  const rows = data.items.map(pr => {
    const state =
      pr.state === 'closed' && pr.pull_request?.merged_at
        ? '🟣 Merged'
        : pr.state === 'open'
        ? '🟢 Open'
        : '🔴 Closed';
    const repo = pr.repository_url.split('/').slice(-2).join('/');
    return `| [${pr.title}](${pr.html_url}) | ${repo} | ${state} |`;
  }).join('\n');

  const section = [
    '<!-- RECENT-PRS:START -->',
    '| PR | Repository | Status |',
    '|---|---|---|',
    rows,
    '<!-- RECENT-PRS:END -->',
  ].join('\n');

  let readme = fs.readFileSync('README.md', 'utf8');
  readme = readme.replace(
    /<!-- RECENT-PRS:START -->[\s\S]*?<!-- RECENT-PRS:END -->/,
    section
  );
  fs.writeFileSync('README.md', readme);
  console.log('README updated.');
}

main();
