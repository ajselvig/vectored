
import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'
import { IModel, ModelKey } from '../model/model'
import Tile from '../model/tile'
import Selection from '../ui/selection'
import { ProjectLevelPart, ProjectState } from './project-level-part'
import { AppPart } from './app-part'

const log = new tuff.logging.Logger("Tree")

export class Tree extends ProjectLevelPart<ProjectState> {

    readonly tileParts: {[id: string]: TreeTilePart} = {}

    get parentClasses(): string[] {
        return [styles.treeLayout]
    }

    makeTileParts() {
        const parts = this.tileParts
        let newPart = false
        this.state.project.eachOfType("tile", tile => {
            if (!parts[tile.id]) {
                parts[tile.id] = this.makePart(TreeTilePart, {tile, app: this.state.app})
                newPart = true
            }
        })
        if (newPart) {
            this.dirty()
        }
    }
    
    render(parent: tuff.parts.PartTag) {
        this.state.project.eachOfType("tile", tile => {
            let tilePart = this.tileParts[tile.id]
            if (tilePart) {
                parent.part(tilePart)
            }
        }, {sorted: true})
    }

}

export const TreeItemClick = tuff.messages.typedKey<ModelKey>()

type TileState = {
    tile: Tile
    app: AppPart
}

class TreeTilePart extends tuff.parts.Part<TileState> {

    tile!: Tile
    selection!: Selection
    project!: Project

    async init() {
        
        this.tile = this.state.tile
        this.project = this.tile.project
        this.selection = this.state.app.selection

        log.info(`Initializing tree tile event listeners for ${this.tile.def.name}`)
        this.onClick(TreeItemClick, m => {
            log.info(`Clicked tree item`, m.data)
            const item = this.project.find(m.data)
            this.selection.append(item, !m.event.shiftKey)
        })

        this.selection.addListener(`tree-tile-${this.tile.id}`, (_) => {
            this.dirty()
        })
    }

    render(parent: tuff.parts.PartTag) {
        log.info(`Rendering tree for ${this.tile.def.name}`)
        this.renderItem(parent, this.tile)

    }

    renderItem(parent: tuff.parts.PartTag, model: IModel) {
        parent.div(styles.treeItem, item => {
            item.a(styles.treeItemSelf, self => {
                self.emitClick(TreeItemClick, model.key)
                if (model.type == 'tile') {
                    self.class(styles.header, styles.stickyTop)
                }
                if (this.selection.isSelected(model.key)) {
                    self.class(styles.treeItemSelected)
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