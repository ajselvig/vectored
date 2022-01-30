import Project from "../model/project"
import { ProjectPart } from "./project-part"
import * as styles from '../styles.css'
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"

import * as tuff from 'tuff-core'

export class AppPart extends tuff.parts.Part<{}> {

    topBar!: TopBar
    bottomBar!: BottomBar
    projectPart!: ProjectPart

    init() {
        const project = new Project()
        project.makeTile(0, 0, 100, 100)
        project.makeTile(200, 0, 300, 100)
        project.makeTile(0, 200, 300, 300)
        this.projectPart = this.makePart(ProjectPart, project)

        this.topBar = this.makeStatelessPart(TopBar)
        this.bottomBar = this.makeStatelessPart(BottomBar)
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.div(styles.appLayout, container => {
            container.part(this.topBar)
            container.part(this.projectPart)
            container.part(this.bottomBar)
        })
    }

}