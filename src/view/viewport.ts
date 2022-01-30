import * as styles from '../styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { TilePart } from "./tile-part"
import * as geom from '../util/geom'

const log = new tuff.logging.Logger("Viewport")
export class Viewport extends tuff.parts.Part<Project> {
    tileParts: {[id: string]: TilePart} = {}

    viewportToPlane = geom.identityMatrix()

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.viewport)

        // compute the plane size based on the bounding box of the tiles
        const tilesBox = this.state.boundingBox
        const xSpanTiles = tilesBox.xmax - tilesBox.xmin
        const ySpanTiles = tilesBox.ymax - tilesBox.ymin
        // compute larger spans so that there's room to scroll,
        // with a minimum for small projects
        const xSpan = Math.min(xSpanTiles*4, 1000)
        const ySpan = Math.min(ySpanTiles*4, 1000)
        const tileCenter = tilesBox.center
        const bounds = geom.box(
            tileCenter.x - xSpan/2,
            tileCenter.y - ySpan/2,
            tileCenter.x + xSpan/2,
            tileCenter.y + ySpan/2
        )
        log.info("Bounds:", bounds)
        const size = geom.boxSize(bounds)

        // compute a transform from viewport to plane space
        this.viewportToPlane = geom.identityMatrix()
            .translate(-bounds.xmin, -bounds.ymin)
        
        
        const parts = this.tileParts
        parent.div(styles.plane, plane => {       
            this.state.each("tile", tile => {
                if (!parts[tile.id]) {
                    parts[tile.id] = this.makePart(TilePart, tile)
                }
                // make a container for the tile at the correct size and position
                const tileBox = geom.transformBox(tile.box, this.viewportToPlane)
                plane.div(styles.tileContainer, tileContainer => {
                    tileContainer.part(parts[tile.id])
                }).css({
                    left: `${tileBox.xmin}px`, 
                    top: `${tileBox.ymin}px`,
                    width: `${tileBox.xmax-tileBox.xmin}px`,
                    height: `${tileBox.ymax-tileBox.ymin}px`
                })
            })
        }).css({width: `${size.x}px`, height: `${size.y}px`})

    }

}