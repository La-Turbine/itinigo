import { pluginIcon } from "./tailwind-plugin-icon"
export default {
  plugins: [
    pluginIcon({
      collections: [{ collection: "ion" }, { collection: "carbon" }, { collection: "lucide" }],
    }),
  ],
}
