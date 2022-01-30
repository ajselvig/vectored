import * as tuff from 'tuff-core'
import Tile from "../model/tile"
import * as styles from '../styles.css'

export class TilePart extends tuff.parts.Part<Tile> {
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.tile)
            .text(this.state.name)
            .css({
                left: `${this.state.left}px`, 
                top: `${this.state.top}px`,
                width: `${this.state.width}px`,
                height: `${this.state.height}px`
            })
    }
    
}