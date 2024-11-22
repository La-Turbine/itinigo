import { $ } from "bun"

const text = await $`git log --pretty=format:'%ai' --shortstat`.text()

// split by new line and group by 3 lines
// 1st line: cast to Date
// 2nd line: extract the numbers
// 3rd line: ignore
const chunks = text.split("\n").reduce((acc, line, i) => {
  const index = Math.floor(i / 3)
  acc[index] = acc[index] || []
  if (i % 3 === 0) acc[index].push(new Date(line))
  if (i % 3 === 1) acc[index].push(line.match(/\d+/g).map(Number))
  // if (i % 3 === 2) acc[index].push(line)
  return acc
}, [] as [Date, number[]][])

// Group by day
const groups = chunks.reduce((acc, [date, [files, insertions, deletions]]) => {
  const key = date.toISOString().slice(0, 10) + " " + (date.getDay() || 7)
  acc[key] = acc[key] || { commits: 0, files: 0, insertions: 0, deletions: 0 }
  acc[key].commits++
  acc[key].files += files
  acc[key].insertions += insertions ?? 0
  acc[key].deletions += deletions ?? 0
  return acc
}, {} as Record<string, { files: number; insertions: number; deletions: number }>)

// {
//   "2024": {
//     commits: 98,
//     files: 493,
//     insertions: 17877,
//     deletions: 2248,
//   },
// }

const resume = Object.entries(groups).reduce((acc, [date, { commits, files, insertions, deletions }]) => acc + `${date}: ${commits}c, ${files}f, ${insertions}+, ${deletions}-\n`, "")

//-2024-11-22 5: last
//-2024-11-19 2: 3c, 10f, 31+, 31-
//-2024-11-18 1: 1c, 3f, 8+, 7-
// 2024-11-15 5: 6c, 30f, 165+, 71-
// 2024-11-08 5: 6c, 40f, 89+, 62-
// 2024-10-25 5: 5c, 24f, 269+, 246-
// 2024-10-11 5: 5c, 39f, 143+, 169-
// 2024-10-04 5: 2c, 6f, 56+, 28-
// 2024-09-27 5: 15c, 62f, 288+, 193-
//-2024-09-23 1: 1c, 10f, 113+, 42-
// 2024-09-21 6: 13c, 37f, 155+, 149-
// 2024-09-20 5: 5c, 32f, 306+, 143-
// 2024-09-13 5: 8c, 27f, 268+, 86-
// 2024-09-08 7: 1c, 4f, 63+, 70-
//-2024-09-07 6: 1c, 1f, 17+, 1-
// 2024-09-06 5: 2c, 21f, 193+, 251-
//-2024-09-03 2: 1c, 1f, 2+, 2-
//-2024-09-02 1: 1c, 1f, 11+, 1-
// 2024-09-01 7: 2c, 5f, 50+, 35-
// 2024-08-31 6: 1c, 3f, 172+, 102-
// 2024-08-23 5: 2c, 16f, 435+, 9-
// 2024-08-22 4: 1c, 6f, 1922+, 27-
// 2024-08-19 1: 3c, 6f, 2025+, 78-
///2024-08-16 5: 2c, 6f, 35+, 12-
///2024-08-07 3: 1c, 4f, 112+, 13-
// 2024-08-02 5: 5c, 43f, 469+, 208-
///2024-07-29 1: 1c, 4f, 64+, 26-
///2024-07-22 1: 2c, 10f, 311+, 85-
// 2024-07-21 7: 2c, 42f, 10105+, 101-

// => 29 jours total
// => 20 jours effectifs

console.log(resume)
