import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'
import { TilePart } from "./tile-part"
const box = tuff.box
const mat = tuff.mat
const vec = tuff.vec
import * as interaction from '../ui/interaction'
import { OverlayPart } from './overlay'
import { IModel, ModelKey } from '../model/model'
import { Box } from 'tuff-core/box'
import { Vec } from 'tuff-core/vec'
import { Interactor } from '../ui/interaction'
import { ProjectLevelPart, ProjectState } from './project-level-part'
import { tileUpdatedKey } from '../model/tile'

const log = new tuff.logging.Logger("Viewport")

export const minZoom = 0.1
export const maxZoom = 10
export const zoomStep = 0.25

export const zoomInKey = tuff.messages.untypedKey()
export const zoomOutKey = tuff.messages.untypedKey()

const planeKey = tuff.messages.untypedKey()

export class Viewport extends ProjectLevelPart<ProjectState> {
    overlayPart!: OverlayPart

    planeVirtualToActual = mat.identity()
    planeActualToVirtual = mat.identity()
    planeVirtualToViewport = mat.identity()
    virtualCenter = vec.identity()

    // projection of the viewport onto the virtual plane space
    virtualBox!: Box

    viewportSize!: Vec

    /**
     * General untyped interaction key for messages not associated with a specific model.
     */
    interactKey = tuff.messages.untypedKey()

    async init() {
        this.onClick(zoomInKey, _ => {
            this.zoomIn()
        }, {attach: "passive"})
        this.onClick(zoomOutKey, _ => {
            this.zoomOut()
        }, {attach: "passive"})

        this.onScroll(this.interactKey, _ => {
            // log.info('scroll')
            // this.stale()
        })

        this.overlayPart = this.makePart(OverlayPart, this as Viewport)


        this.onMouseOver(interaction.modelKey, m => {
            log.debug(`Model mouse over`, m)
            const model = this.getModel(m)
            this.interactor.onMouseOver(model, m.event)
            this.overlayPart.dirty()
        })
        this.onMouseOut(interaction.modelKey, m => {
            log.debug(`Model mouse out`, m)
            const model = this.getModel(m)
            this.interactor.onMouseOut(model, m.event)
            this.overlayPart.dirty()
        })
        this.onMouseDown(interaction.modelKey, m => {
            log.info(`Model mouse down`, m)
            const model = this.getModel(m)
            this.interactor.onMouseDown(model, m.event)
            this.overlayPart.dirty()
        })
        this.onMouseMove(this.interactKey, m => {
            log.info(`Mouse move`, m)
            this.interactor.onMouseMove(m.event)
            this.overlayPart.dirty()
        })
        this.onMouseUp(this.interactKey, m => {
            log.info(`Mouse up`, m)
            this.interactor.onMouseUp(m.event)
            this.overlayPart.dirty()
        })

        this.onAnyKeyPress(m => {
            log.debug(`KeyPress ${m.data.id}`, m)
            this.interactor.onKeyPress(m)
        })

        this.onClick(planeKey, _ => {
            log.info("Clicked on plane")
            this.selection.clear()
            this.overlayPart.dirty()
        })

        this.listenMessage(tileUpdatedKey, m => {
            log.info(`Tile ${m.data.id} updated`)
            const tilePart = this.getTilePart(m.data.id)
            if (tilePart) {
                tilePart.dirty()
                this.overlayPart.dirty()
            }
        }, {attach: "passive"})
    }

    get app() {
        return this.state.app
    }

    get project() {
        return this.state.project
    }

    get interactor(): Interactor {
        return this.app.interactor
    }

    get selection() {
        return this.app.selection
    }

    getModel(m: tuff.messages.Message<'mouseover' | 'mouseout' | 'mousedown', ModelKey>): IModel {
        m.event.stopPropagation()
        m.event.stopImmediatePropagation()
        m.event.preventDefault()
        return this.state.project.find(m.data)
    }

    update(elem: HTMLElement): void {
        log.info("Update", elem)
        const scroller = elem.getElementsByClassName(styles.viewportScroller)[0]

        // if tmpCenter is set, update the scroll position to center on it
        if (this.tmpCenter && this.viewportSize) {
            const actualCenter = mat.transform(this.planeVirtualToActual, this.tmpCenter)
            scroller.scrollLeft =  actualCenter.x - this.viewportSize.x/2
            scroller.scrollTop = actualCenter.y - this.viewportSize.y/2
            log.info(`Updating scroll position to ${scroller.scrollLeft},${scroller.scrollTop} based on tmpCenter`, this.tmpCenter)
            this.tmpCenter = undefined
        }

        // compute the metrics used to create the overlay transform
        const actualBox = box.make(scroller.scrollLeft, scroller.scrollTop, scroller.clientWidth, scroller.clientHeight)
        this.virtualBox = mat.transformBox(this.planeActualToVirtual, actualBox)
        this.lastCenter = box.center(this.virtualBox)
        this.planeVirtualToViewport = mat.translate(this.planeVirtualToActual, -scroller.scrollLeft/this.zoom, -scroller.scrollTop/this.zoom)
        this.viewportSize = vec.make(scroller.clientWidth, scroller.clientHeight)
        // this.drawOverlay()
    }


    /// Tiles

    tileParts: {[id: string]: TilePart} = {}

    makeTileParts() {
        const parts = this.tileParts
        let newPart = false
        this.project.eachOfType("tile", tile => {
            if (!parts[tile.id]) {
                parts[tile.id] = this.makePart(TilePart, tile)
                newPart = true
            }
        })
        if (newPart) {
            this.dirty()
        }
    }

    getTilePart(id: string): TilePart | undefined {
        return this.tileParts[id]
    }



    /// Zoom / Centering

    zoom: number = 1

    /**
     * Temporarily store the center of the viewport that will be 
     * used for the next update then discarded.
     */
    private tmpCenter?: Vec

    /**
     * Store the center of the viewport (in plane virtual space)
     * after every update so that it can be used by rememberCenter().
     */
    private lastCenter?: Vec

    /**
     * Assign the last center as `tmpCenter` so that it will be restored on the next `update()`.
     */
    rememberCenter() {
        this.tmpCenter = this.lastCenter
    }

    /**
     * Sets `tmpCenter` to the center of the actual content.
     */
    centerOnContent() {
        const tilesBox = this.project.boundingBox
        this.tmpCenter = box.center(tilesBox)
        log.info(`Centering on content at`, this.tmpCenter)
        this.dirty()
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom + zoomStep, maxZoom)
        log.info(`Zoom in to ${this.zoom}`)
        this.rememberCenter()
        this.dirty()
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - zoomStep, minZoom)
        log.info(`Zoom out to ${this.zoom}`)
        this.rememberCenter()
        this.dirty()
    }


    /// Rendering
    
    get parentClasses(): string[] {
        return [styles.viewport]    
    }

    render(parent: tuff.parts.PartTag) {

        // compute the plane size based on the bounding box of the tiles
        const tilesBox = this.project.boundingBox
        
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
        
        const gridSize = this.project.planeGridSize

        parent.div(styles.viewportScroller, scroller => {
            scroller.emitScroll(this.interactKey)
            scroller.emitMouseMove(this.interactKey)
            scroller.emitMouseUp(this.interactKey)
            scroller.div(styles.plane, plane => { 
                // make a separate plane layer to collect interaction events 
                // so it doesn't receive any events from the rest of the children
                plane.div(styles.planeInteract).emitClick(planeKey)
                
                // render each tile
                for (const part of Object.values(this.tileParts)) {
                    // make a container for the tile at the correct size and position
                    const tileBox = mat.transformBox(this.planeVirtualToActual, part.state.def.bounds)
                    plane.div(styles.tileContainer, tileContainer => {
                        tileContainer.part(part)
                    }).css({
                        left: `${tileBox.x}px`, 
                        top: `${tileBox.y}px`,
                        width: `${tileBox.width}px`,
                        height: `${tileBox.height}px`
                    })
                }

                // render the overlay part
                plane.part(this.overlayPart)
            }).css({
                width: `${bounds.width}px`, 
                height: `${bounds.height}px`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                backgroundPosition: `${-gridSize/2}px ${-gridSize/2}px`
            })   
        })

        parent.canvas({id: this.overlayId}, styles.overlayCanvas)
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
            this.overlay.width = this.viewportSize.x*2
            this.overlay.height = this.viewportSize.y*2
            // const ctx = this.overlayContext!

            // for now, let's try to render these in the DOM
            // this.selection.each(selected => {
            //     if (selected.type == 'tile') {
            //         const tile = selected as Tile
            //         const box = mat.transformBox(this.planeVirtualToViewport, tile.def.bounds)
            //         ctx.strokeStyle = '#ff0000'
            //         ctx.lineWidth = 2
            //         ctx.strokeRect(box.x, box.y, box.width, box.height)
            //     }
            // })
        })
    }

}