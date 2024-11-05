import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const displayFolder = this.datgui.addFolder("Display");
        displayFolder
            .add(this.contents.myReader, "displacementFactor", 0, 5)
            .step(0.01)
            .onChange((value)=>this.contents.myReader.updateDisplacementFactor(value));
        displayFolder
            .add(this.contents.myReader, "shaderTexture", ["Rapid Racer Logo", "F1 Cars", "Ayrton Senna", "Parrot", "Leclerc"])
            .onChange((value)=>this.contents.myReader.updateShaderTexture(value));

        
        /*
        const folderGeometry = this.datgui.addFolder("Curve");
        folderGeometry
            .add(this.contents.myReader.track, "segments", 10, 200)
            .step(50)
            .onChange((value)=>this.contents.myReader.track.updateCurve(value));
        folderGeometry
            .add(this.contents.myReader.track, "closedCurve")
            .onChange((value)=>this.contents.myReader.track.updateCurveClosing(value));
        folderGeometry
            .add(this.contents.myReader.track, "textureRepeat", 1, 100)
            .step(1)
            .onChange((value)=>{this.contents.myReader.track.updateTextureRepeat(value)});
        folderGeometry
            .add(this.contents.myReader.track, "showLine")
            .name("Show line")
            .onChange(()=>this.contents.myReader.track.updateLineVisibility());
        folderGeometry
            .add(this.contents.myReader.track, "showWireframe")
            .name("Show wireframe")
            .onChange(()=>this.contents.myReader.track.updateWireframeVisibility());
        folderGeometry
            .add(this.contents.myReader.track, "showMesh")
            .name("Show mesh")
            .onChange(()=>this.contents.myReader.track.updateMeshVisibility());

        const animationFolder = this.datgui.addFolder("Animation");*/

        //animationFolder.add(this.contents.autonomousCar, 'mixerPause', true).name("pause");
    }
}

export { MyGuiInterface };