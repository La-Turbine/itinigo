import { $ } from "bun"

const log = await $`git log --pretty=format:'%ai' --shortstat`.text()

// split by new line and group by 3 lines
// 1st line: cast to Date
// 2nd line: extract the numbers
// 3rd line: ignore
const chunks = log.split("\n").reduce(
  (acc, line, i) => {
    const index = Math.floor(i / 3)
    acc[index] = acc[index] || []
    if (i % 3 === 0) acc[index].push(new Date(line))
    if (i % 3 === 1) acc[index].push(line.match(/\d+/g).map(Number))
    // if (i % 3 === 2) acc[index].push(line)
    return acc
  },
  [] as [Date, number[]][],
)

// Group by month
const groups = chunks.reduce((acc, [date, [files, insertions, deletions]]) => {
  const [y, m, d] = date.toISOString().slice(0, 10).split("-")
  const key = `${y}-${m}`
  acc[key] = acc[key] || { commits: 0, files: 0, insertions: 0, deletions: 0, days: {} }
  acc[key].days[`${y}-${m}-${d}`] = 1
  acc[key].commits++
  acc[key].files += files
  acc[key].insertions += insertions ?? 0
  acc[key].deletions += deletions ?? 0
  return acc
}, {})

const table1 = Object.entries(groups).map(([month, { days, commits, files, insertions, deletions }]) => ({ month, days: Object.keys(days).length, commits, files, insertions, deletions }))
console.table(table1)

const complexity = await $`scc -i js,ts,vue,css --by-file --format json`.json()
const table2 = complexity.map(({ Name, Count, Lines, Bytes, Complexity }) => ({ language: Name, files: Count, lines: Lines, size: Math.round(Bytes / 1024) + " KB", complexity: Complexity }))
console.table(table2)

// ┌───┬──────┬──────┬─────────┬───────┬────────────┬───────────┐
// │   │ year │ days │ commits │ files │ insertions │ deletions │
// ├───┼──────┼──────┼─────────┼───────┼────────────┼───────────┤
// │ 0 │ 2024 │ 32   │ 106     │ 538   │ 18151      │ 2404      │
// │ 1 │ 2025 │ 11   │ 19      │ 133   │ 7711       │ 18737     │
// └───┴──────┴──────┴─────────┴───────┴────────────┴───────────┘
// ┌───┬─────────┬──────┬─────────┬───────┬────────────┬───────────┐
// │   │ month   │ days │ commits │ files │ insertions │ deletions │
// ├───┼─────────┼──────┼─────────┼───────┼────────────┼───────────┤
// │ 0 │ 2025-10 │ 8    │ 15      │ 105   │ 5643       │ 18151     │
// │ 1 │ 2025-09 │ 1    │ 1       │ 8     │ 128        │ 227       │
// │ 2 │ 2025-08 │ 2    │ 3       │ 20    │ 1940       │ 359       │
// │ 3 │ 2024-12 │ 2    │ 2       │ 11    │ 65         │ 56        │
// │ 4 │ 2024-11 │ 6    │ 22      │ 117   │ 502        │ 271       │
// │ 5 │ 2024-10 │ 3    │ 12      │ 69    │ 468        │ 443       │
// │ 6 │ 2024-09 │ 11   │ 50      │ 201   │ 1466       │ 973       │
// │ 7 │ 2024-08 │ 7    │ 15      │ 84    │ 5170       │ 449       │
// │ 8 │ 2024-07 │ 3    │ 5       │ 56    │ 10480      │ 212       │
// └───┴─────────┴──────┴─────────┴───────┴────────────┴───────────┘
// ┌───┬────────────┬───────┬───────┬───────┬────────────┐
// │   │ language   │ files │ lines │ size  │ complexity │
// ├───┼────────────┼───────┼───────┼───────┼────────────┤
// │ 0 │ Vue        │ 14    │ 1156  │ 52 KB │ 37         │
// │ 1 │ TypeScript │ 6     │ 448   │ 18 KB │ 62         │
// │ 2 │ CSS        │ 2     │ 49    │ 2 KB  │ 0          │
// │ 3 │ JavaScript │ 2     │ 70    │ 2 KB  │ 6          │
// └───┴────────────┴───────┴───────┴───────┴────────────┘
