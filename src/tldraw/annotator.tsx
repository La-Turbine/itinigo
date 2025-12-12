// @ts-nocheck
// https://examples.tldraw.com/image-annotator/full
// https://examples.tldraw.com/image-component
// https://examples.tldraw.com/custom-menus
// https://examples.tldraw.com/shape-with-geometry
import "./annotator.css"
import React from "react"
import {
  Tldraw,
  Editor,
  exportToBlob,
  //
  getSnapshot,
  loadSnapshot,
  //
  TLComponents,
  TLImageShape,
  DefaultColorThemePalette,
  DefaultColorStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  DefaultToolbar,
  defaultShapeUtils,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeArrowheadEndStyle,
  SelectToolbarItem,
  ArrowToolbarItem,
  OvalToolbarItem,
  EllipseToolbarItem,
  TriangleToolbarItem,
} from "tldraw"
type AnnotatorImage = {
  src: string
  width: number
  height: number
  type: string
}

export function ImageAnnotationEditor({ image, onDone }: { image: AnnotatorImage; onDone(result: Blob): void }) {
  let editor: Editor
  function onMount(ed: Editor) {
    editor = ed

    // Turn off debug mode
    // editor.updateInstanceState({ isDebugMode: false })

    if (image.document) {
      const { w, h } = image.document.store["asset:image"].props
      image.width = w
      image.height = h
      loadSnapshot(editor.store, image)
    } else {
      // Create the asset and image shape
      const disc = {
        w: image.width * 0.5,
        h: image.height * 0.15,
        x: image.width * 0.25,
        y: image.height * 0.83,
      }
      editor.createAssets([
        {
          id: "asset:image",
          typeName: "asset",
          type: "image",
          meta: {},
          props: {
            w: image.width,
            h: image.height,
            mimeType: image.type,
            src: image.src,
            name: "image",
            isAnimated: false,
          },
        },
        {
          id: "asset:disc",
          typeName: "asset",
          type: "image",
          meta: {},
          props: {
            w: 100,
            h: 50,
            mimeType: "image/svg/xml",
            src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><ellipse cx="50" cy="25" rx="50" ry="25" fill="#4465e9" /></svg>`)}`,
            name: "image",
            isAnimated: false,
          },
        },
      ])
      editor.createShape<TLImageShape>({
        id: "shape:image",
        type: "image",
        x: 0,
        y: 0,
        isLocked: true,
        props: {
          w: image.width,
          h: image.height,
          assetId: "asset:image",
        },
      })
      editor.createShape<TLImageShape>({
        id: "shape:disc",
        type: "image",
        x: disc.x,
        y: disc.y,
        isLocked: true,
        props: {
          w: disc.w,
          h: disc.h,
          assetId: "asset:disc",
        },
      })

      // Reset the history
      editor.clearHistory()
    }

    /**
     * We don't want the user to be able to scroll away from the image, or zoom it all the way out. This
     * component hooks into camera updates to keep the camera constrained - try uploading a very long,
     * thin image and seeing how the camera behaves.
     */
    editor.setCameraOptions({
      constraints: {
        initialZoom: "fit-max",
        baseZoom: "default",
        bounds: { w: image.width, h: image.height, x: 0, y: 0 },
        padding: { x: 0, y: 0 },
        origin: { x: 0.5, y: 0.5 },
        behavior: "contain",
      },
      zoomSteps: [1, 2], // 0.5
      zoomSpeed: 1,
      panSpeed: 1,
      isLocked: true, // Disable manual panning/zooming for now
    })
    editor.setCamera(editor.getCamera(), { reset: true })
  }

  function onUiEvent(event: string, options: any) {
    if (event === "select-tool" && options.id === "arrow") {
      editor.setStyleForNextShapes(DefaultColorStyle, "black")
      editor.setStyleForNextShapes(DefaultColorStyle, "blue")
      editor.setStyleForNextShapes(DefaultFillStyle, "solid")
      // editor.setStyleForNextShapes(ArrowShapeArrowheadStartStyle, "dot")
      editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, "dot")
    }
    if (event === "select-tool" && options.id === "geo-ellipse") {
      editor.setStyleForNextShapes(DefaultColorStyle, "blue")
      editor.setStyleForNextShapes(DefaultFillStyle, "fill")
    }
    if (event === "select-tool" && options.id === "geo-oval") {
      editor.setStyleForNextShapes(DefaultColorStyle, "green")
      editor.setStyleForNextShapes(DefaultFillStyle, "none")
    }
    if (event === "select-tool" && options.id === "geo-triangle") {
      editor.setStyleForNextShapes(DefaultColorStyle, "red")
      editor.setStyleForNextShapes(DefaultFillStyle, "solid")
    }
  }

  DefaultColorThemePalette.lightMode.green.solid = "#6BDB09"
  DefaultColorStyle.setDefaultValue("green")
  DefaultSizeStyle.setDefaultValue("xl")
  function Toolbar() {
    return (
      <DefaultToolbar>
        <SelectToolbarItem />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(sharedPhoto.type) && <ArrowToolbarItem />}
        {/* {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(sharedPhoto.type) && <EllipseToolbarItem />} */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(sharedPhoto.type) && <OvalToolbarItem />}
        {[0, 4, 5].includes(sharedPhoto.type) && <TriangleToolbarItem />}
      </DefaultToolbar>
    )
  }
  function DoneButton({ onClick }: { onClick(result: Blob): void }) {
    return (
      <>
        <button
          className="DoneButton"
          onClick={async () => {
            const bounds = editor.getZoomLevel() > 1.05 && editor.getViewportPageBounds()
            const blob = await exportToBlob({ editor, format: "jpeg", opts: { bounds, padding: 0 } })
            const snapshot = getSnapshot(editor.store)
            onClick({ blob, snapshot })
          }}
        >
          Terminer
        </button>
        <button
          className="DoneButton"
          style={{ backgroundColor: "#f87171" }}
          onClick={async () => {
            onClick({})
          }}
        >
          Annuler
        </button>
      </>
    )
  }
  const components: TLComponents = {
    ActionsMenu: null,
    ContextMenu: null,
    DebugMenu: null,
    HelpMenu: null,
    KeyboardShortcutsDialog: null,
    MainMenu: null,
    NavigationPanel: null,
    PageMenu: null,
    // QuickActions: null,
    StylePanel: null,
    Toolbar: Toolbar,
    ZoomMenu: null,
    SharePanel: () => <DoneButton onClick={onDone} />,
  }

  const shapeUtils = defaultShapeUtils.map((Util) => {
    // NOTE: no way to disable all shapes, it crashes on ovals/ellipse
    if (Util.type !== "arrow") return Util
    return class extends Util {
      canEdit(shape: any) {
        return false
      }
    }
  })

  return <Tldraw onMount={onMount} onUiEvent={onUiEvent} components={components} shapeUtils={shapeUtils} forceMobile />
}
