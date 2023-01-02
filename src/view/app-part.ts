import Project from "../model/project"
import { ProjectPart } from "./project-part"
import * as styles from '../ui-styles.css'
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"
import * as tuff from 'tuff-core'
import { ActionHistory } from "../ui/actions"
import * as interaction from '../ui/interaction'

import tsUrl from '/assets/test/typescript.svg'
import viteUrl from '/assets/test/vite.svg'
import npmUrl from '/assets/test/npm.svg'
import svgUrl from '/assets/test/svg.svg'
import vitestUrl from '/assets/test/vitest.svg'
import Selection, { SelectionInteractor } from "../ui/selection"

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
    
    history!: ActionHistory

    selection!: Selection

    interactor!: interaction.Interactor

    interactionKey = tuff.messages.untypedKey()

    async init() {
        const project = new Project()

        this.history = new ActionHistory(this)
        
        this.selection = new Selection(this)
        this.selection.addListener(this.id, _ => {
            log.info("App selection changed")
            // this.stale()
        })
        
        this.interactor = new SelectionInteractor(this.selection)

        log.info("Loading some demo tiles...")
        this.projectPart = this.makePart(ProjectPart, {project, app: this})
        
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