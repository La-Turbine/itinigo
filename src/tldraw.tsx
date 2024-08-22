import { Tldraw } from "tldraw"
import r2wc from "@r2wc/react-to-web-component"
import "tldraw/tldraw.css"
customElements.define("wc-tldraw", r2wc(Tldraw))
