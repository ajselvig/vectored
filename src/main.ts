import './styles.css'
import * as tuff from 'tuff-core'
import { AppPart } from './view/app-part'

console.log('tuff: ', tuff)

tuff.parts.Part.mount(AppPart, 'app-container', {})

