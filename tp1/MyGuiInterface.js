import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';

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
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Left', 'Top', 'Front' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open();

        const lightFolder = this.datgui.addFolder('Spotlight')
        lightFolder.addColor(this.contents.spotLight, 'color').name("color")
        lightFolder.add(this.contents.spotLight, 'intensity', 0, 120).name("intensity (cd)")
        lightFolder.add(this.contents.spotLight, 'distance', 0, 20).name("distance")
        lightFolder.add(this.contents.spotLight, 'angle', 0, 90).name("spot angle (degree)").onChange( (value) => {  
            this.contents.spotLight.angle = value * (Math.PI / 180);
        });
        
        lightFolder.add(this.contents.spotLight, 'penumbra', 0, 1).name("penumbra ratio")
        lightFolder.add(this.contents.spotLight.position, 'x', -15, 15).name("position x")
        lightFolder.add(this.contents.spotLight.position, 'y', 0, 20).name("position y")
        lightFolder.open();

        const dayFolder = this.datgui.addFolder('Time');
        const lightPosition = this.contents.directionalLight.position;
        const slider = dayFolder.add(this.contents, 'dayhour', 1, 24).name("Hour"); // Use an object to bind the value
        dayFolder.open();

        slider.onChange(function (value) {
            console.log(value);
            if (value <12) {
                lightPosition.y = (value*2-5);
            }
            else {
                lightPosition.y = (21 - 2*(value-12));
            }
        
        });



        const allLightsFolder = this.datgui.addFolder('Active Lights');

        const spotLight = this.contents.spotLight;
        const pointLight = this.contents.pointLight;
        const directionalLight = this.contents.directionalLight;
        const ambientLight = this.contents.ambientLight;

        const activeLights = {spotLight: true, pointLight: true, directionalLight: true, ambientLight: true};
        allLightsFolder.add(activeLights, 'spotLight').name('Spot Light').onChange( (value) => {
            spotLight.visible = value;
        })

        allLightsFolder.add(activeLights, 'pointLight').name('Point Light').onChange( (value) => {
            pointLight.visible = value;
        })

        allLightsFolder.add(activeLights, 'directionalLight').name('Directional Light').onChange( (value) => {
            directionalLight.visible = value;
        })

        allLightsFolder.add(activeLights, 'ambientLight').name('Ambient Light').onChange( (value) => {
            ambientLight.visible = value;
        })
        const paredeMaterial = this.contents.planeMaterial;
        paredeMaterial.map.wrapS = THREE.ClampToEdgeWrapping;
        paredeMaterial.map.wrapS = THREE.ClampToEdgeWrapping;
        const textureOptions = this.datgui.addFolder('Texture Options');
        const brickText = new THREE.TextureLoader().load('textures/parede_textures/brick.jpg');
        const blocksText = new THREE.TextureLoader().load('textures/parede_textures/blocks.jpg');
        const waveText = new THREE.TextureLoader().load('textures/parede_textures/wave.jpg');
        const rocksText = new THREE.TextureLoader().load('textures/parede_textures/rocks.jpg');
        textureOptions.add(this.contents, 'paredeMaterial.map', ["Brick", "Wave", "Rocks", "Blocks"]).name('Wall Texture').setValue("Blocks").onChange((value) => {
            if (value == "Brick") {
                paredeMaterial.map = brickText;
            }
            else if (value == "Blocks") {
                paredeMaterial.map = blocksText;
            }
            else if (value == "Wave") {
                paredeMaterial.map = waveText;
            }
            else if (value == "Rocks") {
                paredeMaterial.map = rocksText;
            }
        }) 
        textureOptions.add(paredeMaterial.map, 'wrapS', {
            Repeat: THREE.RepeatWrapping,
            ClampToEdge: THREE.ClampToEdgeWrapping,
            MirroredRepeat: THREE.MirroredRepeatWrapping,
          }).name('Wrapping Mode U').onChange((value) => {
            paredeMaterial.map.wrapS = value;
        })


        textureOptions.add(paredeMaterial.map, 'wrapT', {
            Repeat: THREE.RepeatWrapping,
            ClampToEdge: THREE.ClampToEdgeWrapping,
            MirroredRepeat: THREE.MirroredRepeatWrapping,
          }).name('Wrapping Mode V').onChange((value) => {
            paredeMaterial.map.wrapT = value;
        })
        
        textureOptions.add(paredeMaterial.map.repeat, 'x', 0, 5).name('Repeat U').onChange((value) => {
            paredeMaterial.map.repeat.x = value;
            console.log(paredeMaterial.map.wrapS);
        })
        textureOptions.add(paredeMaterial.map.repeat, 'y', 0, 5).name('Repeat V').onChange((value) => {
            paredeMaterial.map.repeat.y = value;
        })
        
        textureOptions.add(paredeMaterial.map.offset, 'x', 0, 5).name('Offset U').onChange((value) => {
            paredeMaterial.map.offset.x = value;
        })
        textureOptions.add(paredeMaterial.map.offset, 'y', 0, 5).name('Offset V').onChange((value) => {
            paredeMaterial.map.offset.y = value;
        })

        textureOptions.add(paredeMaterial.map, 'rotation', 0, 5).name('Rotation').onChange((value) => {
            paredeMaterial.map.rotation = value;
        })
        
    }
}

export { MyGuiInterface };