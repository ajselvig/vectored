
import * as styles from '../styles.css'
import * as tuff from 'tuff-core'

export class BottomBar extends tuff.parts.Part<{}> {

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.bottomBar)
        parent.text('Bottom bar')
    }

}