import * as styles from '../styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { TilePart } from "./tile-part"
import * as box from '../geom/box'
import * as mat from '../geom/mat'
import * as vec from '../geom/vec'

const log = new tuff.logging.Logger("Viewport")

export class Viewport extends tuff.parts.Part<Project> {
    tileParts: {[id: string]: TilePart} = {}

    viewportToPlane = mat.identity()

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.viewport)

        // compute the plane size based on the bounding box of the tiles
        const tilesBox = this.state.boundingBox
        
        // compute larger spans so that there's room to scroll,
        // with a minimum for small projects
        const xSpan = Math.min(tilesBox.width*4, 1000)
        const ySpan = Math.min(tilesBox.height*4, 1000)
        const tileCenter = box.center(tilesBox)
        const bounds = box.make(
            tileCenter.x - xSpan/2,
            tileCenter.y - ySpan/2,
            xSpan,
            ySpan
        )
        log.info("Bounds:", bounds)

        // compute a transform from viewport to plane space
        this.viewportToPlane = mat.translate(mat.identity(), vec.make(-bounds.x, -bounds.y))
        
        const parts = this.tileParts
        const gridSize = this.state.planeGridSize

        parent.div(styles.plane, plane => {       
            this.state.eachOfType("tile", tile => {
                if (!parts[tile.id]) {
                    parts[tile.id] = this.makePart(TilePart, tile)
                }
                // make a container for the tile at the correct size and position
                const tileBox = mat.transformBox(this.viewportToPlane, tile.def.bounds)
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