import * as styles from '../styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'

export class Settings extends tuff.parts.Part<Project> {

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.settingsLayout)
        parent.text('Settings')
    }

}