import './styles.css'
import Project from './model/project'
import * as tuff from 'tuff-core'
import { ProjectPart } from './view/project-part'

console.log('tuff: ', tuff)

class App extends tuff.parts.Part<{}> {

    projectPart!: ProjectPart

    init() {
        const project = new Project()
        project.makeTile(0, 0, 100, 100)
        project.makeTile(200, 0, 300, 100)
        project.makeTile(0, 200, 300, 300)
        this.projectPart = this.makePart(ProjectPart, project)
    }

    render(parent: tuff.tags.DivTag) {
        parent.part(this.projectPart)
    }

}


tuff.parts.Part.mount(App, 'vectored-app', {})

