
import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'

export class BottomBar extends tuff.parts.Part<{}> {
    
    get parentClasses(): string[] {
        return [styles.bottomBar]
    }

    render(parent: tuff.parts.PartTag) {
        parent.text('Bottom bar')
    }

}