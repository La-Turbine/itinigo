import "tldraw/tldraw.css"
// import { Tldraw } from "tldraw"
import { ImageAnnotationEditor } from "./tldraw/ImageAnnotationEditor"
import r2wc from "@r2wc/react-to-web-component"
customElements.define("wc-tldraw", r2wc(ImageAnnotationEditor, { props: { image: "json", xxx: "function" } }))
