import * as tuff from 'tuff-core'
import Tile from "../model/tile"
import * as styles from '../styles.css'

export class TilePart extends tuff.parts.Part<Tile> {
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.tile)
        parent.div(styles.tileLabel)
            .text(this.state.name)
    }
    
}