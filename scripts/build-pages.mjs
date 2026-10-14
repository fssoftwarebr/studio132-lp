import { cp, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const output = '.pages-dist'
await mkdir(output, { recursive: true })
for (const asset of ['index.html', 'favicon.ico', 'css', 'js', 'images', 'data']) {
  await cp(asset, `${output}/${asset}`, { recursive: true })
}
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
await writeFile(`${output}/version.json`, JSON.stringify({ commit }) + '\n')
console.log(`Pages assets prepared for ${commit}`)
