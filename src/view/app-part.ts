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
import vitestUrl from '/assets/test/vitest.svg'

const urls = [
    tsUrl,
    viteUrl,
    npmUrl,
    svgUrl,
    vitestUrl
]

tuff.logging.Logger.level = 'info'
const log = new tuff.logging.Logger("App")

export class AppPart extends tuff.parts.Part<{}> {

    topBar!: TopBar
    bottomBar!: BottomBar
    projectPart!: ProjectPart

    interactionKey = tuff.messages.untypedKey()

    async init() {
        const project = new Project()

        log.info("Loading some demo tiles...")
        this.projectPart = this.makePart(ProjectPart, project)
        
        for (let url of urls) {
            this.projectPart.fetchTile(url)
        }

        this.topBar = this.makeStatelessPart(TopBar)
        this.bottomBar = this.makeStatelessPart(BottomBar)
    }
    
    render(parent: tuff.parts.PartTag) {        
        parent.emitKeyDown(this.interactionKey)
        parent.div(styles.appLayout, container => {
            container.part(this.topBar)
            container.part(this.projectPart)
            container.part(this.bottomBar)
        })
    }

}