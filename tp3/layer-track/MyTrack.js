import * as THREE from 'three';

class MyTrack {
    /**
       constructs the object
       @param {MyContents} scene The scene object
    */
    constructor(app) {
        this.app = app;

        //Curve related attributes
        this.segments = 100;
        this.width = 4;
        this.textureRepeat = 1;
        this.showWireframe = false;
        this.showMesh = true;
        this.showLine = false;
        this.closedCurve = false;
        this.path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(40, 0, 0),
            new THREE.Vector3(40, 0, -70),
            new THREE.Vector3(0, 0, -70),
            new THREE.Vector3(0, 0, -50),
            new THREE.Vector3(-15, 0, -50),
            new THREE.Vector3(-15, 0, -35),
            new THREE.Vector3(15, 0, -35),
            new THREE.Vector3(15, 0, -20),
            new THREE.Vector3(-40, 0, -20),
            new THREE.Vector3(-40, 0, 0),
            new THREE.Vector3(0, 0, 0),
        ]);
        

        this.drawTrack();
        this.drawFinishLine();
    }

    drawTrack() {
        this.buildCurve();
    }
    
    /**
     * Creates the necessary elements for the curve
     */
    buildCurve() {
        this.createCurveMaterialsTextures();
        this.createCurveObjects();
    }

    /**
     * Create materials for the curve elements: the mesh, the line and the wireframe
     */
    createCurveMaterialsTextures() {
        const texture = new THREE.TextureLoader().load("./layer-track/textures/road.jpg");
        texture.wrapS = THREE.RepeatWrapping;

        this.material = new THREE.MeshBasicMaterial({ map: texture });
        this.material.map.repeat.set(50, 3);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;

        this.wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        opacity: 0.3,
        wireframe: true,
        transparent: true,
        });

        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    }

    /**
     * Creates the mesh, the line and the wireframe used to visualize the curve
     */
    createCurveObjects() {
        let geometry = new THREE.TubeGeometry(
            this.path,
            this.segments,
            this.width,
            3,
            this.closedCurve
        );

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);

        let points = this.path.getPoints(this.segments);
        let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        this.line = new THREE.Line(bGeometry, this.lineMaterial);

        this.curve = new THREE.Group();
        console.log(this.mesh);
        this.mesh.visible = this.showMesh;
        this.wireframe.visible = this.showWireframe;
        this.line.visible = this.showLine;

        this.curve.add(this.mesh);
        this.curve.add(this.wireframe);
        this.curve.add(this.line);

        this.curve.rotateZ(Math.PI);
        this.curve.scale.set(1,0.2,1);
        //this.curve.position.set(15, 0, 25);

        this.curve.visible = false;
        this.app.scene.add(this.curve);
    }

    drawFinishLine() {
        this.finishLine = new THREE.Group();

        const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
        const boxGeometry = new THREE.BoxGeometry(4, 0.1);
        const planeGeometry = new THREE.PlaneGeometry(4, 1);
        const planeGeometry2 = new THREE.PlaneGeometry(4, 0.6);

        // Criar o material cinza
        const materialCinza = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x808080) });
        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF) });
        const finishTexture = new THREE.TextureLoader().load("layer-track/textures/finish.png");
        const redFinishTexture = new THREE.TextureLoader().load("layer-track/textures/red_finish_line.png");
        const finishMaterial = new THREE.MeshBasicMaterial({map: finishTexture, side: THREE.DoubleSide});
        const redFinishMaterial = new THREE.MeshBasicMaterial({map: redFinishTexture, side: THREE.DoubleSide});

        const verticalPostLeft = new THREE.Mesh(cylinderGeometry, materialCinza);
        verticalPostLeft.position.set(0, 0, 2);

        const verticalPostRight = verticalPostLeft.clone();
        verticalPostRight.position.set(0, 0, -2);

        const banner = new THREE.Mesh(boxGeometry, materialBranco);
        banner.rotation.set(Math.PI/2, 0, Math.PI/2);
        banner.position.set(0, 0.95, 0);

        const bannerText = new THREE.Mesh(planeGeometry, finishMaterial);
        bannerText.rotation.set(0, Math.PI/2, 0);
        bannerText.position.set(0.06, 0.95, 0);

        const bannerText2 = new THREE.Mesh(planeGeometry, finishMaterial);
        bannerText2.rotation.set(0, -Math.PI/2, 0);
        bannerText2.position.set(-0.06, 0.95, 0);

        const redFinish = new THREE.Mesh(planeGeometry2, redFinishMaterial);
        redFinish.rotation.set(Math.PI/2, 0, Math.PI/2);
        redFinish.position.set(0, -1.5, 0);

        this.finishLine.add(verticalPostLeft);
        this.finishLine.add(verticalPostRight);
        this.finishLine.add(banner);
        this.finishLine.add(bannerText);
        this.finishLine.add(bannerText2);
        this.finishLine.add(redFinish);

        this.finishLine.position.set(0, 4.17, 0);
        this.finishLine.scale.set(3, 2.5, 2);

        this.finishLine.visible = false;

        this.app.scene.add(this.finishLine);
    }

    /**
     * Called when user changes number of segments in UI. Recreates the curve's objects accordingly.
     */
    updateCurve() {
        if (this.curve !== undefined && this.curve !== null) {
            this.app.scene.remove(this.curve);
        }
        this.buildCurve();
    }

    /**
     * Called when user curve's closed parameter in the UI. Recreates the curve's objects accordingly.
     */
    updateCurveClosing() {
        if (this.curve !== undefined && this.curve !== null) {
            this.app.scene.remove(this.curve);
        }
        this.buildCurve();
    }

    /**
     * Called when user changes number of texture repeats in UI. Updates the repeat vector for the curve's texture.
     * @param {number} value - repeat value in S (or U) provided by user
     */
    updateTextureRepeat(value) {
        this.material.map.repeat.set(value, 3);
    }

    /**
     * Called when user changes line visibility. Shows/hides line object.
     */
    updateLineVisibility() {
        this.line.visible = this.showLine;
    }
    
    /**
     * Called when user changes wireframe visibility. Shows/hides wireframe object.
     */
    updateWireframeVisibility() {
        this.wireframe.visible = this.showWireframe;
    }

    /**
     * Called when user changes mesh visibility. Shows/hides mesh object.
     */
    updateMeshVisibility() {
        this.mesh.visible = this.showMesh;
    }
}

export { MyTrack };