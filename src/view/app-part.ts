import Project from "../model/project"
import { ProjectPart } from "./project-part"
import * as styles from '../ui-styles.css'
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"
import * as tuff from 'tuff-core'

import tsUrl from '/assets/test/typescript.svg'
import viteUrl from '/assets/test/vite.svg'
import npmUrl from '/assets/test/npm.svg'
import svgUrl from '/assets/test/svg.svg'

const urls = {
    typescript: tsUrl,
    vite: viteUrl,
    npm: npmUrl,
    svg: svgUrl
}

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
        
        for (let [name, url] of Object.entries(urls)) {
            this.projectPart.fetchTile(name, url)
        }

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