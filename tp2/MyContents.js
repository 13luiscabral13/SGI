import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { SceneGraph } from './SceneGraph.js';
import { MySceneData } from './parser/MySceneData.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // options for textures and dat.gui
        this.options = {
            minFilters: {
                'NearestFilter': THREE.NearestFilter,
                'NearestMipMapLinearFilter': THREE.NearestMipMapLinearFilter,
                'NearestMipMapNearestFilter': THREE.NearestMipMapNearestFilter,
                'LinearFilter ': THREE.LinearFilter,
                'LinearMipMapLinearFilter (Default)': THREE.LinearMipMapLinearFilter,
                'LinearMipmapNearestFilter': THREE.LinearMipmapNearestFilter,
            },
            magFilters: {
                'NearestFilter': THREE.NearestFilter,
                'LinearFilter (Default)': THREE.LinearFilter,
            },
        }

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
		this.reader.open("scenes/SGI_TP2_XML_T02_G06_v02/SGI_TP2_XML_T02_G06_v02.xml");
    }


    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
        this.lastFlickerTimes = [Date.now(), Date.now(), Date.now()];

    }

    /**
     * Called to set the Global Attributes on the XML
     * @param {*} options array of Global Attributes retrieved from the XML
     */
    setGlobals(options) {
        if (options.background.isColor) {
            this.background = new THREE.Color(options.background);
        }
        if (options.ambient.isColor) {
            this.ambient = new THREE.Color(options.background);
        }


    }

    /**
     * Called to set the value of fog for the entire scene
     * @param {Color} fog fog to be set to
     */
    setFog(fog) {
        if (fog.isColor) {
            this.fog = new THREE.Color(fog);
        }
    }

    /**
     * Called to set the array of cameras available on scene
     * @param {Array} cameras entire array of cameras
     * @param {String} activeCameraId id of the active camera
     */
    setCameras(cameras, activeCameraId) {
        this.myCameras = [];
        const aspect = window.innerWidth / window.innerHeight;

        for(var index in cameras) {
            let camera = cameras[index];
            let near = camera.near
            let far = camera.far
            let position = camera.location;
            let lookAt = new THREE.Vector3(camera.target[0], camera.target[1], camera.target[2]);

            if(camera.type === 'orthogonal') {
                let left = camera.left
                let right = camera.right
                let top = camera.top
                let bottom = camera.bottom
                let orthographic = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
                orthographic.position.set(position[0], position[1], position[2]);
                orthographic.lookAt(lookAt);
                this.myCameras[camera.id] = orthographic;

            }
            else if(camera.type === 'perspective') {
                const fov = camera.fov;

                let perspective = new THREE.PerspectiveCamera(fov, aspect, near, far);
                perspective.position.set(position[0], position[1], position[2]);
                perspective.lookAt(lookAt);
                this.myCameras[camera.id] = perspective;
            }
        }

        this.app.cameras = this.myCameras;
        this.app.setActiveCamera(activeCameraId);
    }

    /**
     * Called to retrieve all the lights on a specific node
     * @param {Node} child node to search the lights of
     */
    traverseLights(child) {
        if (child.type==="lod" || child.type==="lodnoderef") {
            return;
        }
        if(child.type === "node" ) { // There may be children that are lights 
            for(let secondchild of child['children']) {
                this.traverseLights(secondchild)
            }
            return;    
        }
        else if (child.type === "primitive") { // There are no extra children
            return;
        }

        let light = null;

        const enabled = child.enabled;
        const color = new THREE.Color(child.color);
        const intensity = child.intensity;
        const position = child.position;
        const castShadow = child.castshadow;
        const shadowfar = child.shadowfar;
        const shadowmapsize = child.shadowmapsize;
        
        
        if(child.type === 'pointlight') {
            const distance = child.distance;
            const decay = child.decay;

            light = new THREE.PointLight(color, intensity, distance, decay);
            light.castShadow = castShadow;
            light.shadowMap = shadowmapsize;
            light.shadowFar = shadowfar;

            //let helper = new THREE.PointLightHelper(light);
            //this.app.scene.add(helper);
        }
        else if(child.type === 'spotlight') {
            const distance = child.distance;
            const angle = child.angle;
            const decay = child.decay;
            const penumbra = child.penumbra;
            const target = child.target;

            light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
            light.target.position.set(target[0], target[1], target[2]);
            light.castShadow = castShadow;
            light.shadowMap = shadowmapsize;
            light.shadowFar = shadowfar;
        }
        else if(child.type === 'directionallight') {
            const shadowleft = child.shadowleft;
            const shadowright = child.shadowright;
            const shadowbottom = child.shadowbottom;
            const shadowtop = child.shadowtop;

            light = new THREE.DirectionalLight(color, intensity);

            light.castShadow = castShadow;
            light.shadowMap = shadowmapsize;
            light.shadowFar = shadowfar;
            light.shadowCameraLeft = shadowleft;
            light.shadowCameraRight = shadowright;
            light.shadowCameraBottom = shadowbottom;
            light.shadowCameraTop = shadowtop;
        }

        light.position.set(position[0], position[1], position[2]);
        light.visible = enabled;

        this.app.scene.add(light);
        this.myLights[child.id] = light;
    }
    
    /**
     * Called to set the array of lights available on scene
     * @param {MySceneData} data the entire scene data object
     */
    setLights(data) { // function that starts the light traversal
        this.myLights = [];
        let rootNode = data.nodes['scene'];
        this.traverseLights(rootNode);
    }
        
    /**
     * Called to create the entire array of materials to be available on scene
     * @param {Array} materials the entire array of materials
     */
    createMaterials(materials) {
        this.materialsDict = {};
        for (var key in materials) {
            let material = materials[key];

            let wireframe = material.wireframe;
            let twosided = material.twosided;

            this.materialsDict[material.id] = new THREE.MeshPhongMaterial({
                color: new THREE.Color(material.color),
                specular: new THREE.Color(material.specular),
                shininess: parseFloat(material.shininess),
                emissive: new THREE.Color(material.emissive),
                wireframe: wireframe,
                side: twosided ? THREE.DoubleSide : THREE.FrontSide,
            });

            let texture = this.texturesDict[material.textureref];

            if(texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(material.texlength_s, material.texlength_t);
                this.materialsDict[material.id].map = texture;
            }

            let bumpTexture = this.texturesDict[material.bumpref];

            if(bumpTexture) {
                bumpTexture.repeat.set(material.texlength_s, material.texlength_t);
                bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
                this.materialsDict[material.id].bumpMap = bumpTexture;
                this.materialsDict[material.id].bumpScale = material.bumpscale * this.bumpScale;
            }

            let specularTexture = this.texturesDict[material.specularref];

            if(specularTexture) {
                specularTexture.repeat.set(material.texlength_s, material.texlength_t);
                specularTexture.wrapS = specularTexture.wrapT = THREE.RepeatWrapping;
                this.materialsDict[material.id].specularMap = specularTexture;
            }
        }
    }
    /**
     * Called to create the entire array of textures to be available on scene
     * @param {Array} textures the entire array of textures
     */
    createTextures(textures) {
        this.showTexture = true
        this.showBumpTexture = true
        this.showWireframe = false
        this.bumpScale = 1;
        this.lareiraScale = null;
        this.lenhaScale = null;

        this.texturesDict = {};
        for(var key in textures) {
            let texture = textures[key]

            if(texture.id === "some-video") {
                const video = document.getElementById('some-video');
                this.texturesDict[texture.id] = new THREE.VideoTexture(video);
                this.texturesDict[texture.id].colorSpace = THREE.SRGBColorSpace;
                continue;
            }

            this.texturesDict[texture.id] = new THREE.TextureLoader().load(texture.filepath)
            
            if(texture.mipmap0 !== null) {
                //Mipmaps will be manually defined
                this.texturesDict[texture.id].generateMipmaps = false;

                this.loadMipmap(this.texturesDict[texture.id], 0, texture.mipmap0);
                this.loadMipmap(this.texturesDict[texture.id], 1, texture.mipmap1);
                this.loadMipmap(this.texturesDict[texture.id], 2, texture.mipmap2);
                this.loadMipmap(this.texturesDict[texture.id], 3, texture.mipmap3);
                this.loadMipmap(this.texturesDict[texture.id], 4, texture.mipmap4);
                this.loadMipmap(this.texturesDict[texture.id], 5, texture.mipmap5);
                this.loadMipmap(this.texturesDict[texture.id], 6, texture.mipmap6);
                this.loadMipmap(this.texturesDict[texture.id], 7, texture.mipmap7);
            }
            else {
                this.texturesDict[texture.id].generateMipmaps = true;
                this.texturesDict[texture.id].minFilter = THREE.LinearMipMapLinearFilter;
                this.texturesDict[texture.id].magFilter = THREE.LinearFilter;
            }
        }
    }
    /**
     * Called to create the skybox available on scene
     * @param {*} skyboxesNodes the skyboxes nodes
     */
    createSkybox(skyboxesNodes) {
        this.skyboxes = {};

        for(var key in skyboxesNodes) {
            let nodeSkybox = skyboxesNodes[key];

            const skyboxGeometry = new THREE.BoxGeometry(nodeSkybox.size[0], nodeSkybox.size[1], nodeSkybox.size[2]);
            const emissiveColor = new THREE.Color(nodeSkybox.emissive);

            const skyboxMaterials = [
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(nodeSkybox.left), side: THREE.BackSide, emissive: emissiveColor, emissiveIntensity: nodeSkybox.intensity }), // up
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(nodeSkybox.front), side: THREE.BackSide, emissive: emissiveColor, emissiveIntensity: nodeSkybox.intensity }), // down
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(nodeSkybox.up), side: THREE.BackSide, emissive: emissiveColor, emissiveIntensity: nodeSkybox.intensity }), // left
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(nodeSkybox.down), side: THREE.BackSide, emissive: emissiveColor, emissiveIntensity: nodeSkybox.intensity }), // right
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(nodeSkybox.back), side: THREE.BackSide, emissive: emissiveColor, emissiveIntensity: nodeSkybox.intensity }), // front
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(nodeSkybox.right), side: THREE.BackSide, emissive: emissiveColor, emissiveIntensity: nodeSkybox.intensity })  // back
            ];

            let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
            skybox.position.set(nodeSkybox.center[0], nodeSkybox.center[1], nodeSkybox.center[2]);

            this.app.scene.add(skybox);
            this.skyboxes[nodeSkybox.id] = skybox;
        }
    }

    /**
     * load an image and create a mipmap to be added to a texture at the defined level.
     * In between, add the image some text and control squares. These items become part of the picture
     * 
     * @param {*} parentTexture the texture to which the mipmap is added
     * @param {*} level the level of the mipmap
     * @param {*} path the path for the mipmap image
    // * @param {*} size if size not null inscribe the value in the mipmap. null by default
    // * @param {*} color a color to be used for demo
     */
    loadMipmap(parentTexture, level, path)
    {
        // load texture. On loaded call the function to create the mipmap for the specified level 
        new THREE.TextureLoader().load(path, 
            function(mipmapTexture)  // onLoad callback
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                ctx.scale(1, 1);
                
                // const fontSize = 48
                const img = mipmapTexture.image         
                canvas.width = img.width;
                canvas.height = img.height

                // first draw the image
                ctx.drawImage(img, 0, 0 )
                             
                // set the mipmap image in the parent texture in the appropriate level
                parentTexture.mipmaps[level] = canvas
            },
            undefined, // onProgress callback currently not supported
            function(err) {
                console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
            }
        )
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        this.data = data;
        console.info("scene data loaded " + data + ". visit MySceneData javascript class to check contents for each data item.")
        this.onAfterSceneLoadedAndBeforeRender(data);
    }

    output(obj, indent = 0) {
        console.log("" + new Array(indent * 4).join(' ') + " - " + obj.type + " " + (obj.id !== undefined ? "'" + obj.id + "'" : ""))
    }

    /**
     * Called after the scene xml file load is complete and before the scene is being rendered
     * @param {MySceneData} data the entire scene data object
     */
    onAfterSceneLoadedAndBeforeRender(data) {
        this.setGlobals(data.options)
        this.setCameras(data.cameras, data.activeCameraId)
        this.setLights(data)
        this.createTextures(data.textures);
        this.createMaterials(data.materials);
        this.createSkybox(data.skyboxes);

        this.sceneGraph = new SceneGraph(this);
        
        this.rootNode = this.sceneGraph.traverseNode(data.nodes['scene']);
        this.app.scene.add(this.rootNode);
    }
    /**
     * Called to change the visibility of a Christmas light
     * @param {PointLight} light the light to be changed
     */
    flicker(light) { 
        light.visible = !light.visible; // Changes the light
    }

    /**
     * Providing the correct light-flickering cycle to the overall scene
     * Every light is active during exactly one second, except the red one
     */
    update() {
        const currentTimeR = Date.now();
        if (currentTimeR - this.lastFlickerTimes[0] >= 3000) { // 3000 milliseconds = 3 seconds
            this.flicker(this.myLights["redlight1"]);
            // Update the last flicker time of this specific light
            this.lastFlickerTimes[0] = currentTimeR;
        }
        else if (currentTimeR - this.lastFlickerTimes[0] >= 2000 && currentTimeR - this.lastFlickerTimes[1] >= 1000)  { // 1 ms after the last time blue flickered + 2 ms after the last time red flickered
            this.flicker(this.myLights["bluelight1"]);
            this.lastFlickerTimes[1] = currentTimeR;
        }

        else if (currentTimeR - this.lastFlickerTimes[0] >= 1000  && currentTimeR - this.lastFlickerTimes[2] >= 1000) { // 1 ms after the last time green flickered + 2 ms after the last time red flickered
            this.flicker(this.myLights["greenlight1"]);
            this.lastFlickerTimes[2] = currentTimeR;
        }
    }
    /**
     * Called to change the visibility of the textures on scene
     * @param {Boolean} value chosen to make textures visible, or invisible
     */
    updateShowTexture(value) {
        this.showTexture = value

        for(var key in this.data.materials) {
            const materialNode = this.data.materials[key]
            if(this.materialsDict[materialNode.id].map !== null) {
                this.materialsDict[materialNode.id].map = this.showTexture ? this.texturesDict[materialNode.textureref] : ''
                this.materialsDict[materialNode.id].needsUpdate = true
            }
        }
    }
    /**
     * Called to change the visibility of the bump textures on scene
     * @param {Boolean} value chosen to make bump textures visible, or invisible
     */
    updateShowBumpTexture(value) {
        this.showBumpTexture = value

        for(var key in this.data.materials) {
            const materialNode = this.data.materials[key]
            if(this.materialsDict[materialNode.id].bumpMap !== null) {
                this.materialsDict[materialNode.id].bumpMap = this.showBumpTexture ? this.texturesDict[materialNode.bumpref] : ''
                this.materialsDict[materialNode.id].needsUpdate = true
            }
        }
    }
    /**
     * Called to change the visibility of the wireframes of objects on scene
     * @param {Boolean} value chosen to make wireframes visible, or invisible for tree and presents
     */
    updateShowWireframe(value) {
        this.showWireframe = value
        
        if(this.materialsDict['giftOneApp']) {
            this.materialsDict['giftOneApp'].wireframe = this.showWireframe
            this.materialsDict['giftTwoApp'].wireframe = this.showWireframe
            this.materialsDict['giftThreeApp'].wireframe = this.showWireframe
            this.materialsDict['treeApp'].wireframe = this.showWireframe
        }
    }
    /**
     * Called to change the scaling of bump textures on scene
     * @param {Float} value change the scaling of the bump texture to this value
     */
    updateBumpScale(value) {
        this.bumpScale = value

        for(var key in this.data.materials) {
            const materialNode = this.data.materials[key]
            if(this.materialsDict[key].bumpMap) {
                this.materialsDict[key].bumpScale = this.bumpScale * materialNode.bumpscale;
            }
        }
    }
    /**
     * Called to change the painting on scene
     * @param {String} value change the painting to the one chosen
     */
    updatePainting(value) {
        if(this.materialsDict['paint1App'])
            this.materialsDict['paint1App'].map = this.texturesDict[value]
    }
    /**
     * Called to change the min filter to be applied on painting texture
     * @param {String} value change the filter to the one chosen
     */
    updateMinFilter(value) {
        for(var key in this.materialsDict) {
            if(this.materialsDict[key].map) {
                this.materialsDict[key].map.minFilter = value
                this.materialsDict[key].map.needsUpdate = true
            }
        }
    }

    /**
     * Called to change the mag filter to be applied on painting texture
     * @param {String} value change the filter to the one chosen
     */
    updateMagFilter(value) {
        for(var key in this.materialsDict) {
            if(this.materialsDict[key].map) {
                this.materialsDict[key].map.magFilter = value
                this.materialsDict[key].map.needsUpdate = true
            }
        }
    }
}

export { MyContents };