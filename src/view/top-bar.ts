import * as styles from '../styles.css'
import * as tuff from 'tuff-core'

export class TopBar extends tuff.parts.Part<{}> {

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.topBar)
        parent.text('Top bar')
    }

}