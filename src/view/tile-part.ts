import * as tuff from 'tuff-core'
import { HtmlParentTag } from 'tuff-core/html'
import Tile from "../model/tile"
import * as styles from '../ui-styles.css'

export class TilePart extends tuff.parts.Part<Tile> {

    // async init() {
    //     this.dirty()
    // }

    get parentClasses(): string[] {
        return [styles.tile]
    }

    render(parent: tuff.parts.PartTag) {
        parent.div(styles.tileLabel)
            .text(this.state.def.name || this.state.id)
        this.state.renderInHtml(parent as HtmlParentTag)
    }
    
}