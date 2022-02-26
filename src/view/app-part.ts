import Project from "../model/project"
import { ProjectPart } from "./project-part"
import * as styles from '../ui-styles.css'
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"
import tsUrl from '/assets/test/typescript.svg'
import viteUrl from '/assets/test/vite.svg'
import * as tuff from 'tuff-core'

tuff.logging.Logger.level = 'debug'
const log = new tuff.logging.Logger("App")

export class AppPart extends tuff.parts.Part<{}> {

    topBar!: TopBar
    bottomBar!: BottomBar
    projectPart!: ProjectPart

    init() {
        const project = new Project()

        log.info("Loading some demo tiles...")
        this.projectPart = this.makePart(ProjectPart, project)
        this.projectPart.fetchTile('Typescript', tsUrl)
        this.projectPart.fetchTile('Vite', viteUrl)

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