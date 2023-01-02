import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'
import { ProjectLevelPart, ProjectState } from './project-level-part'

export class Settings extends ProjectLevelPart<ProjectState> {

    render(parent: tuff.parts.PartTag) {
        parent.div(styles.settingsLayout)
    }

}