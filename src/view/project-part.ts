import * as tuff from 'tuff-core'
import Project from "../model/project"
import * as styles from '../styles.css'
import { Tree } from "./tree"
import { Settings } from "./settings"
import { Viewport } from "./viewport"
export class ProjectPart extends tuff.parts.Part<Project> {

    tree!: Tree
    viewport!: Viewport
    settings!: Settings

    init() {
        this.tree = this.makePart(Tree, this.state)
        this.viewport = this.makePart(Viewport, this.state)
        this.settings = this.makePart(Settings, this.state)
    }

    render(parent: tuff.parts.PartTag) {
        parent.class(styles.projectLayout)

        parent.part(this.tree)
        parent.part(this.viewport)
        parent.part(this.settings)
    }
    
}