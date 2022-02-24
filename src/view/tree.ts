
import * as styles from '../ui-styles.css'
import Project from "../model/project"
import * as tuff from 'tuff-core'

export class Tree extends tuff.parts.Part<Project> {

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.treeLayout)
    }

}