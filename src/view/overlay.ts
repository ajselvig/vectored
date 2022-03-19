import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { Viewport } from './viewport'
import Selection from '../ui/selection'
import * as box from '../geom/box'
import * as mat from '../geom/mat'
import * as vec from '../geom/vec'
import Tile from '../model/tile'
import { SvgParentTag } from 'tuff-core/dist/svg'

const log = new tuff.logging.Logger("Overlay")

export class OverlayPart extends tuff.parts.Part<Viewport> {
    
    project!: Project
    selection!: Selection


    init() {
        this.project = this.state.state
        this.selection = this.project.selection

        this.selection.addListener("overlay-part", _ => {
            log.info("Selection changed")
            this.dirty()
        })
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.overlayPart)

        parent.svg(styles.tileSvg, svg => {
            const ctx = new OverlayContext(svg, this.state.planeVirtualToActual)
            if (this.state.interactor) {
                this.state.interactor.renderOverlay(ctx)
            }
        })
    }


}


export class OverlayContext {

    localToActual!: mat.Mat
    tile?: Tile

    constructor(readonly parent: SvgParentTag, readonly virtualToActual: mat.Mat) {
        this.localToActual = this.virtualToActual
    }

    setTile(tile: Tile) {
        this.tile = tile
        this.localToActual = mat.translate(this.virtualToActual, tile.left, tile.top)
    }
}
