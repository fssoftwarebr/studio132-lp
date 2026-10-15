import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const output = '.pages-dist'
await mkdir(output, { recursive: true })
for (const asset of ['index.html', 'favicon.ico', 'css', 'js', 'images', 'data']) {
  await cp(asset, `${output}/${asset}`, { recursive: true })
}
// Stable URLs otherwise let returning visitors reuse scripts from an older release.
let html = await readFile(`${output}/index.html`, 'utf8')
const assets = new Set([...html.matchAll(/(?:src|href)="(\/(?:js|css)\/[^"?]+\.(?:js|css))"/g)].map(match => match[1]))
for (const asset of assets) {
  const hash = createHash('sha256').update(await readFile(`${output}${asset}`)).digest('hex').slice(0, 12)
  html = html.replaceAll(`"${asset}"`, `"${asset}?v=${hash}"`)
}
await writeFile(`${output}/index.html`, html)
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
await writeFile(`${output}/version.json`, JSON.stringify({ commit }) + '\n')
console.log(`Pages assets prepared for ${commit}`)
