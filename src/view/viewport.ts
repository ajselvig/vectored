import * as styles from '../styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { TilePart } from "./tile-part"

export class Viewport extends tuff.parts.Part<Project> {
    tileParts: {[id: string]: TilePart} = {}

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.viewport)
        
        const parts = this.tileParts
        this.state.each("tile", tile => {
            if (!parts[tile.id]) {
                parts[tile.id] = this.makePart(TilePart, tile)
            }
            parent.part(parts[tile.id])
        })

    }

}