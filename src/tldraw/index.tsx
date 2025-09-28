import "tldraw/tldraw.css"
// import { TldrawImage } from "tldraw"
import { ImageAnnotationEditor } from "./annotator"
import r2wc from "@r2wc/react-to-web-component"
customElements.define("wc-tldraw", r2wc(ImageAnnotationEditor, { props: { image: "json", onDone: "function" } }))
// customElements.define("wc-tldrawimage", r2wc(TldrawImage, { props: { snapshot: "json" } }))
