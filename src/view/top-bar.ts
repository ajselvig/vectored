import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'
import icons from '../ui/icons'
import { zoomInKey, zoomOutKey } from './viewport'

export class TopBar extends tuff.parts.Part<{}> {

    init() {
    }
    
    render(parent: tuff.parts.PartTag) {
        parent.class(styles.topBar)
        parent.div(styles.topBarLogo).text('Vectored')
        parent.a(styles.topBarIconButton)
            .text(icons.zoomOutLight)
            .emitClick(zoomOutKey)
        parent.a(styles.topBarIconButton)
            .text(icons.zoomInLight)
            .emitClick(zoomInKey)
    }

}