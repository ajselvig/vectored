import './styles.css'
import Project from './model/project'
import * as tuff from 'tuff-core'

console.log('tuff: ', tuff)

class App extends tuff.parts.Part<{}> {
    render(parent: tuff.tags.DivTag) {
        parent.div({text: "Hello Tiny Vector"})
    }

}

const doc = new Project()
doc.makeTile(0, 0, 100, 100)
doc.makeTile(200, 0, 300, 100)

tuff.parts.Part.mount(App, 'vectored-app', {})
