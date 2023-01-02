import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { Viewport } from './viewport'
import Selection from '../ui/selection'
const mat = tuff.mat
import Tile from '../model/tile'
import { SvgParentTag } from 'tuff-core/svg'
import { Mat } from 'tuff-core/mat'

const log = new tuff.logging.Logger("Overlay")

export class OverlayPart extends tuff.parts.Part<Viewport> {
    
    project!: Project
    selection!: Selection


    async init() {
        this.project = this.state.project
        this.selection = this.project.app.selection

        this.selection.addListener("overlay-part", _ => {
            log.info("Selection changed")
            this.dirty()
        })
    }

    get parentClasses(): string[] {
        return [styles.overlayPart]
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.svg(styles.tileSvg, svg => {
            const ctx = new OverlayContext(svg, this.state.planeVirtualToActual)
            if (this.state.interactor) {
                this.state.interactor.renderOverlay(ctx)
            }
        })
    }


}


export class OverlayContext {

    localToActual!: Mat
    tile?: Tile

    constructor(readonly parent: SvgParentTag, readonly virtualToActual: Mat) {
        this.localToActual = this.virtualToActual
    }

    setTile(tile: Tile) {
        this.tile = tile
        this.localToActual = mat.translate(this.virtualToActual, tile.left, tile.top)
    }
}
