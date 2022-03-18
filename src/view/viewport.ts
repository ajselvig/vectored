import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { TilePart } from "./tile-part"
import * as box from '../geom/box'
import * as mat from '../geom/mat'
import * as vec from '../geom/vec'
import Selection from '../ui/selection'
import Tile from '../model/tile'

const log = new tuff.logging.Logger("Viewport")

export const minZoom = 0.1
export const maxZoom = 10
export const zoomStep = 0.25

export const zoomInKey = tuff.messages.untypedKey()
export const zoomOutKey = tuff.messages.untypedKey()

export class Viewport extends tuff.parts.Part<Project> {
    tileParts: {[id: string]: TilePart} = {}

    planeVirtualToActual = mat.identity()
    planeActualToVirtual = mat.identity()
    planeVirtualToViewport = mat.identity()
    virtualCenter = vec.identity()

    // projection of the viewport onto the virtual plane space
    virtualBox!: box.Box

    viewportSize!: vec.Vec

    zoom: number = 1

    scrollKey!: tuff.messages.UntypedKey

    selection!: Selection

    init() {
        this.scrollKey = tuff.messages.untypedKey()
        this.onClick(zoomInKey, _ => {
            this.zoomIn()
        }, {attach: "passive"})
        this.onClick(zoomOutKey, _ => {
            this.zoomOut()
        }, {attach: "passive"})

        this.onScroll(this.scrollKey, _ => {
            log.info('scroll')
            this.stale()
        })
        this.selection = this.state.selection
        this.selection.addListener(this.id, _ => {
            log.info("Viewport selection changed")
            this.stale()
        })
    }


    update(elem: HTMLElement): void {
        log.info("Update", elem)
        const scroller = elem.getElementsByClassName(styles.viewportScroller)[0]
        const actualBox = box.make(scroller.scrollLeft, scroller.scrollTop, scroller.clientWidth, scroller.clientHeight)
        this.virtualBox = mat.transformBox(this.planeActualToVirtual, actualBox)
        this.planeVirtualToViewport = mat.translate(this.planeVirtualToActual, -scroller.scrollLeft/this.zoom, -scroller.scrollTop/this.zoom)
        this.viewportSize = vec.make(scroller.clientWidth, scroller.clientHeight)
        this.drawOverlay()
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom + zoomStep, maxZoom)
        log.info(`Zoom in to ${this.zoom}`)
        this.dirty()
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - zoomStep, minZoom)
        log.info(`Zoom out to ${this.zoom}`)
        this.dirty()
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.viewport)

        // compute the plane size based on the bounding box of the tiles
        const tilesBox = this.state.boundingBox
        
        // compute larger spans so that there's room to scroll,
        // with a minimum for small projects
        const xSpan = Math.max(tilesBox.width*1.5, 1000)
        const ySpan = Math.max(tilesBox.height*1.5, 1000)
        const tileCenter = box.center(tilesBox)
        const bounds = box.make(
            tileCenter.x - xSpan/2,
            tileCenter.y - ySpan/2,
            xSpan,
            ySpan
        )
        log.debug("Rendering viewport with bounds:", bounds)

        // compute transforms between actual and virtual plane space
        const builder = mat.builder()
            .translate(-bounds.x, -bounds.y)
            .scale(this.zoom)
        this.planeVirtualToActual = builder.build()
        this.planeActualToVirtual = builder.buildInverse()
        
        const parts = this.tileParts
        const gridSize = this.state.planeGridSize

        parent.div(styles.viewportScroller, scroller => {
            scroller.emitScroll(this.scrollKey)  
            scroller.div(styles.plane, plane => { 
                this.state.eachOfType("tile", tile => {
                    if (!parts[tile.id]) {
                        parts[tile.id] = this.makePart(TilePart, tile)
                    }
                    // make a container for the tile at the correct size and position
                    const tileBox = mat.transformBox(this.planeVirtualToActual, tile.def.bounds)
                    plane.div(styles.tileContainer, tileContainer => {
                        tileContainer.part(parts[tile.id])
                    }).css({
                        left: `${tileBox.x}px`, 
                        top: `${tileBox.y}px`,
                        width: `${tileBox.width}px`,
                        height: `${tileBox.height}px`
                    })
                })
            }).css({
                width: `${bounds.width}px`, 
                height: `${bounds.height}px`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                backgroundPosition: `${-gridSize/2}px ${-gridSize/2}px`
            })   
        })

        parent.canvas({id: this.overlayId}, styles.overlay)

    }


    /// Overlay

    overlayId = '__viewport-overlay__'

    overlay?: HTMLCanvasElement

    overlayContext?: CanvasRenderingContext2D

    drawOverlay() {
        log.time("drawOverlay", () => {
            const overlay = document.getElementById(this.overlayId)
            if (!overlay) {
                log.warn("No overlay element!")
                return
            }
            if (!this.overlayContext || !this.overlay || this.overlay != overlay) {
                log.info("Generating new overlay context", overlay)
                this.overlay = overlay as HTMLCanvasElement
                const context = (overlay as HTMLCanvasElement).getContext('2d')
                if (!context) {
                    log.warn("Error creating overlay context!")
                    return
                }
                this.overlayContext = context
            }
            this.overlay.width = this.viewportSize.x
            this.overlay.height = this.viewportSize.y
            const ctx = this.overlayContext!

            this.selection.each(selected => {
                if (selected.type == 'tile') {
                    const tile = selected as Tile
                    const box = mat.transformBox(this.planeVirtualToViewport, tile.def.bounds)
                    ctx.strokeStyle = '#ff0000'
                    ctx.lineWidth = 2
                    ctx.strokeRect(box.x, box.y, box.width, box.height)
                }
            })
        })
    }

}