import { DivTag } from "tuff-core/dist/tags"
import * as tuff from 'tuff-core'
import Project from "../model/project"
import { TilePart } from "./tile-part"
import * as styles from '../styles.css'

const {Part} = tuff.parts

export class ProjectPart extends Part<Project> {

    tileParts: {[id: string]: TilePart} = {}

    render(parent: DivTag) {
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