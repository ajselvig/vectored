import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { TilePart } from "./tile-part"
import * as box from '../geom/box'
import * as mat from '../geom/mat'
import * as vec from '../geom/vec'

const log = new tuff.logging.Logger("Viewport")

export const minZoom = 0.1
export const maxZoom = 10
export const zoomStep = 0.25

export const zoomInKey = tuff.messages.untypedKey()
export const zoomOutKey = tuff.messages.untypedKey()

export class Viewport extends tuff.parts.Part<Project> {
    tileParts: {[id: string]: TilePart} = {}

    planeVirtualToActual = mat.identity()

    zoom: number = 1

    scrollKey!: tuff.messages.UntypedKey

    init() {
        this.scrollKey = tuff.messages.untypedKey()
        this.onClick(zoomInKey, _ => {
            this.zoomIn()
        }, "passive")
        this.onClick(zoomOutKey, _ => {
            this.zoomOut()
        }, "passive")

        this.onScroll(this.scrollKey, m => {
            this.computeMetrics(m.event.target! as HTMLDivElement)
        })
    }

    computeMetrics(elem: HTMLDivElement) {
        log.info("Compute Metrics", elem)
        const scrollOffset = vec.make(elem.scrollLeft, elem.scrollTop)
        log.info("scroll offset: ", scrollOffset)
        const paneOffset = mat.transform(this.planeVirtualToActual, scrollOffset)
        log.info("pane offset: ", paneOffset)
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
        parent.emitScroll(this.scrollKey)

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

        // compute a transform from viewport to plane space
        this.planeVirtualToActual = mat.scale(mat.translate(mat.identity(), vec.make(-bounds.x, -bounds.y)), this.zoom)
        
        const parts = this.tileParts
        const gridSize = this.state.planeGridSize

        parent.div(styles.plane, plane => {       
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

    }

}