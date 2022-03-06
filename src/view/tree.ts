
import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { IModel } from '../model/model'
import Tile from '../model/tile'

const log = new tuff.logging.Logger("Tree")

export class Tree extends tuff.parts.Part<Project> {

    readonly tileParts: {[id: string]: TreeTilePart} = {}

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.treeLayout)
        this.state.eachOfType("tile", tile => {
            let tilePart = this.tileParts[tile.id]
            if (!tilePart) {
                tilePart = this.makePart(TreeTilePart, tile)
                this.tileParts[tile.id] = tilePart
            }
            parent.part(tilePart)
        }, {sorted: true})
    }

}

export const TreeItemClick = tuff.messages.typedKey<string>()


class TreeTilePart extends tuff.parts.Part<Tile> {

    init() {
        log.info(`Initializing tree tile event listeners for ${this.state.def.name}`)
        this.onClick(TreeItemClick, m => {
            log.info(`Clicked tree item ${m.data}`)
        })
    }

    render(parent: tuff.parts.PartTag) {
        log.info(`Rendering tree for ${this.state.def.name}`)
        this.renderItem(parent, this.state)

    }

    renderItem(parent: tuff.parts.PartTag, model: IModel) {
        parent.div(styles.treeItem, item => {
            item.a(styles.treeItemSelf, self => {
                self.emitClick(TreeItemClick, model.id)
                if (model.type == 'tile') {
                    self.class(styles.header, styles.stickyTop)
                }
                self.div(styles.treeItemTitle).text(model.def.name || model.id)
            })
            item.div(styles.treeItemChildren, children => {
                model.each(child => {
                    this.renderItem(children, child)
                })
            })
        })
    }

}