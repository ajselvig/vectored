import * as tuff from 'tuff-core'
import Project from "../model/project"
import * as styles from '../ui-styles.css'
import { Tree } from "./tree"
import { Settings } from "./settings"
import { Viewport } from "./viewport"

const log = new tuff.logging.Logger("Project Part")

export class ProjectPart extends tuff.parts.Part<Project> {

    tree!: Tree
    viewport!: Viewport
    settings!: Settings

    async init() {
        this.tree = this.makePart(Tree, this.state)
        this.viewport = this.makePart(Viewport, this.state)
        this.settings = this.makePart(Settings, this.state)
    }

    get parentClasses(): string[] {
        return [styles.projectLayout]
    }

    render(parent: tuff.parts.PartTag) {
        parent.part(this.tree)
        parent.part(this.viewport)
        parent.part(this.settings)
    }

    fetchTile(url: string) {
        fetch(url).then(res => {
            res.text().then(raw => {
                const tile = this.state.loadTile(raw)
                if (!tile.def.name?.length || tile.def.name.indexOf('tile')==0) {
                    // it has a generated name, override it with the name from the url
                    const comps = url.split('/')
                    tile.def.name = comps[comps.length-1].split('.')[0]
                }
                log.info(`Loaded tile '${tile.def.name}' from ${url}`)
                this.state.arrangeTiles()
                this.viewport.makeTileParts()
                this.viewport.centerOnContent()
                this.tree.makeTileParts()
                this.dirty()
            })
            
        })
    }
    
}