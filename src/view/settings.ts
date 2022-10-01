import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'

export class Settings extends tuff.parts.Part<Project> {

    render(parent: tuff.parts.PartTag) {
        parent.div(styles.settingsLayout)
    }

}