import { DivTag } from "tuff-core/dist/tags"
import * as tuff from 'tuff-core'
import Tile from "../model/tile"
import * as styles from '../styles.css'

const {Part} = tuff.parts

export class TilePart extends Part<Tile> {
    render(parent: DivTag) {
        parent.div(styles.tile, {text: this.state.name})
            .css({
                left: `${this.state.left}px`, 
                top: `${this.state.top}px`,
                width: `${this.state.width}px`,
                height: `${this.state.height}px`
            })
    }
    
}