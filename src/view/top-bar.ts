import * as styles from '../ui-styles.css'
import * as tuff from 'tuff-core'
import icons from '../ui/icons'
import { zoomInKey, zoomOutKey } from './viewport'

export class TopBar extends tuff.parts.Part<{}> {
    
    render(parent: tuff.parts.PartTag) {
        parent.div(styles.topBar, topBar => {
            topBar.div(styles.topBarLogo).text('Vectored')
            topBar.a(styles.topBarIconButton)
                .text(icons.zoomOutLight)
                .emitClick(zoomOutKey)
                topBar.a(styles.topBarIconButton)
                .text(icons.zoomInLight)
                .emitClick(zoomInKey)
        })
    }

}