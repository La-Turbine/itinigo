// @ts-nocheck
import plugin from "tailwindcss/plugin"
/**
 * Usage:
 * <div class="i-lucide/accessibility"></div>
 * <div class="i-[lucide/accessibility]"></div>
 * <div class="i-[https://api.iconify.design/lucide/accessibility.svg]"></div>
 * Equivalent:
 * <div class="inline-block h-[1em] w-[1em] bg-current [mask:url(https://api.iconify.design/lucide/accessibility.svg)_0_0/100%_100%]"></div>
 * <div class="inline-block h-[1em] w-[1em] bg-[url(https://api.iconify.design/twemoji/flag-france.svg)]"></div> // for colored icons
 * Link:
 * https://icones.netlify.app/collection/lucide?s=accessibility
 */
export const pluginIcon = plugin.withOptions(function (options = {}) {
  // const url = path => `https://api.iconify.design/${path}.svg`
  const { icons = {}, collections = [], width = "1em", height = "1em", separator = "/" } = options
  const values = icons
  collections.forEach((choice) => {
    const { collection = choice, filter } = typeof choice === "string" ? {} : choice
    if (!collection) return
    const { icons = [] } = require(`@iconify/json/json/${collection}.json`) || {}
    Object.keys(icons).forEach((icon) => {
      if (filter && !filter(icon)) return
      values[`${collection}${separator}${icon}`] = `${collection}${separator}${icon}`
    })
  })
  // const svgToURL = (svg) => `url(data:image/svg+xml;base64,${btoa(svg)})`
  const svgToURL = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  const url = (path) => {
    if (/^(http|data|\/)/.test(path)) return `url(${path})`
    if (/^<svg/.test(path)) return svgToURL(path)
    const [collection, icon] = path.split(separator)
    const { aliases = [], icons = [], width = 24, height = 24 } = require(`@iconify/json/json/${collection}.json`) || {}
    const body = icons[icon]?.body ?? icons[aliases[icon]?.parent]?.body
    if (!body) return console.warn(`Icon not found: ${path}`) || ""
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`
    return svgToURL(svg)
  }
  return function ({ matchComponents }) {
    matchComponents(
      {
        i: (link) => {
          if (!link.startsWith("url")) link = url(link)
          if (/currentColor/.test(link))
            return {
              mask: `${link} 0 0/100% 100%`,
              background: "currentColor",
              display: "inline-block",
              width,
              height,
            }
          return {
            background: `${link} 0 0/100% 100%`,
            display: "inline-block",
            width,
            height,
          }
        },
      },
      { values },
    )
  }
})
