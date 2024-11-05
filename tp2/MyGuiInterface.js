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
        //Camera Folder
        const cameraFolder = this.datgui.addFolder('Camera')
        let allCameras = [];
        for(var key in this.app.cameras) {
            allCameras.push(key);
        }

        cameraFolder.add(this.app, 'activeCameraName', allCameras).name("active camera");
        cameraFolder.open();

        //Lights Folder to select which lights to turn on or turn off
        const allLightsFolder = this.datgui.addFolder('Active Lights');
        const activeLights = {};

        for(var key in this.contents.myLights) {
            var light = this.contents.myLights[key];
            activeLights[key] = light.visible;

            function createOnChangeCallback(light) {
                return function (value) {
                  light.visible = value;
                };
            }
            allLightsFolder.add(activeLights, key).onChange(createOnChangeCallback(light));
        }

        //Chairs Folder to move chairs position
        if(this.contents.sceneGraph.nodesDict['chair1']) {
            const chairdFolder = this.datgui.addFolder('Chairs');
        
            chairdFolder.add(this.contents.sceneGraph.nodesDict['chair1'].position, 'x', -10, 10).name("Chair 1 - x");
            chairdFolder.add(this.contents.sceneGraph.nodesDict['chair1'].position, 'z', -10, 10).name("Chair 1 - z");

            chairdFolder.add(this.contents.sceneGraph.nodesDict['chair2'].position, 'x', -10, 10).name("Chair 2 - x");
            chairdFolder.add(this.contents.sceneGraph.nodesDict['chair2'].position, 'z', -10, 10).name("Chair 2 - z");

            chairdFolder.add(this.contents.sceneGraph.nodesDict['chair3'].position, 'x', -10, 10).name("Chair 3 - x");
            chairdFolder.add(this.contents.sceneGraph.nodesDict['chair3'].position, 'z', -10, 10).name("Chair 3 - z");
        }

        //Materials folder to manipulate materials' texture, bump texture, bump scale and wireframe
        const materialFolder = this.datgui.addFolder('Materials');
        var text = {
            showTexture: 'on',
            showBumpTexture: 'on',
            showWireframe: 'on'
        }
        materialFolder.add(text, 'showTexture', { On: 'on', Off: 'off' } ).name("Show texture").onChange( (value) => { this.contents.updateShowTexture(value === 'on') } );
        materialFolder.add(text, 'showBumpTexture', { On: 'on', Off: 'off'} ).name("Show Bump").onChange( (value) => { this.contents.updateShowBumpTexture(value === 'on') } );
        materialFolder.add(text, 'showWireframe', { On: 'on', Off: 'off'} ).name("Show wireframe").onChange( (value) => { this.contents.updateShowWireframe(value === 'on') } );
        materialFolder.add(this.contents, 'bumpScale', 0.01, 1).name("Bump scale").onChange( (value) => { this.contents.updateBumpScale(value) } );

        materialFolder.open();

        //Frame Folder to choose painting on the frame and minFilter and magFilter to be applied
        const frameFolder = this.datgui.addFolder('Frame Painting');
        
        const framePaintings = {
            'Christmas': 'paint1Tex',
            'Caravaggio': 'paint2Tex',
            'Ric': 'paint3Tex'

        }

        var selectedFrame = {
            framePainting: 'Christmas'
        }

        var selectedFilters = {
            minFilter: 'LinearMipMapLinearFilter (Default)',
            magFilter: 'LinearFilter (Default)'
        }

        frameFolder.add(selectedFrame, 'framePainting', framePaintings).name("Paintings").onChange( (value) => { this.contents.updatePainting(value)});
        frameFolder.add(selectedFilters, 'minFilter', this.contents.options.minFilters).name('minFilter (far)').onChange((value) => this.contents.updateMinFilter(value))
        frameFolder.add(selectedFilters, 'magFilter', this.contents.options.magFilters).name('magFilter (close)').onChange((value) => this.contents.updateMagFilter(value))
    }
}

export { MyGuiInterface };