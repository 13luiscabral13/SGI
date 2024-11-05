import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = null

        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0, 2, 0)

        this.mesaColor = "#ffff77"
        this.mesaMaterial = new THREE.MeshPhongMaterial({
            color: this.mesaColor,
            specular: "#000000", emissive: "#000000", shininess: 90
        })

        this.velaMaterial = new THREE.MeshPhongMaterial({ color: "#F8DE7E", specular: "#000000", emissive: "#000000", shininess: 90 })
        this.chamaMaterial = new THREE.MeshPhongMaterial({ color: "#FF512B", specular: "#000000", emissive: "#000000", shininess: 90 })
        this.paredeWrapS = 'ClampToEdgeWrapping';
        this.paredeWrapT = 'ClampToEdgeWrapping';
        this.paredeRepeatU = 1;
        this.paredeRepeatV = 1;

        // plane related attributes
        this.diffusePlaneColor = "#777777"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.paredeTexture = new THREE.TextureLoader().load('textures/parede_textures/blocks.jpg');
        this.floorTexture = new THREE.TextureLoader().load('textures/solo.jpg');
        this.ceilingTexture = new THREE.TextureLoader().load('textures/teto.jpg');
        this.ceilingMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, specular: this.diffusePlaneColor, emissive: "#000000", shininess: this.planeShininess, map: this.ceilingTexture })

        this.planeMaterial = new THREE.MeshPhongMaterial({ specular: this.diffusePlaneColor, emissive: "#000000", shininess: this.planeShininess, map: this.paredeTexture })
        this.floorMaterial = new THREE.MeshPhongMaterial({ specular: this.diffusePlaneColor, emissive: "#000000", shininess: this.planeShininess, map: this.floorTexture })

        // Material para o chapéu
        this.chapeuTexture = new THREE.TextureLoader().load('textures/chapeu.jpg');
        this.chapeuTexture.wrapS = THREE.RepeatWrapping;
        this.chapeuTexture.wrapT = THREE.RepeatWrapping;
        this.chapeuMaterial = new THREE.MeshLambertMaterial({ map: this.chapeuTexture });

        // Material para o prato
        this.pratoTexture = new THREE.TextureLoader().load('textures/prato.jpg');
        this.pratoTexture.wrapS = THREE.RepeatWrapping;
        this.pratoTexture.wrapT = THREE.RepeatWrapping;
        this.pratoMaterial = new THREE.MeshPhongMaterial({ color: "#FFFFFF", specular: "#000000", emissive: "#777777", shininess: 90, map: this.pratoTexture })

        // Material para o tampo 
        this.tampoTexture = new THREE.TextureLoader().load('textures/cadeira_frente.jpg');
        this.tampoMaterial = new THREE.MeshPhongMaterial({ specular: "#CCCCCC", emissive: "#777777", shininess: 0, map: this.tampoTexture })

        // Material para as pernas da mesa
        this.pernasMaterial = new THREE.MeshPhongMaterial({ color: "#A47551", specular: "#FFFFFF", emissive: "#000000", shininess: 0, map: this.tampoTexture })

        // Material para o interior do bolo 
        this.boloIntTexture = new THREE.TextureLoader().load('textures/bolo_lado_interno.jpg');
        this.boloIntMaterial = new THREE.MeshPhongMaterial({ specular: "#777777", emissive: 0, shininess: 0, map: this.boloIntTexture });

        // Material para o exterior do bolo 
        this.boloExtTexture = new THREE.TextureLoader().load('textures/bolo_lado_externo.jpg');
        this.boloExtMaterial = new THREE.MeshLambertMaterial({ map: this.boloExtTexture });

        // Material para o topo do bolo 
        this.boloTopoTexture = new THREE.TextureLoader().load('textures/bolo_topo.jpg');
        this.boloTopoMaterial = new THREE.MeshLambertMaterial({ map: this.boloTopoTexture });

        // Material para a frente da cadeira 
        this.cadeiraTexture = new THREE.TextureLoader().load('textures/cadeira_frente.jpg');
        this.cadeiraMaterial = new THREE.MeshLambertMaterial({ map: this.cadeiraTexture });

        // Material para a frente da cadeira 
        this.cadeiraLadosTexture = new THREE.TextureLoader().load('textures/cadeira_lados.jpg');
        this.cadeiraLadosMaterial = new THREE.MeshLambertMaterial({ map: this.cadeiraLadosTexture });

        // Material para as velas 
        this.velaTexture = new THREE.TextureLoader().load('textures/vela.jpg');
        this.velaMaterial = new THREE.MeshLambertMaterial({ map: this.velaTexture });

        // Material para os quadros 
        this.molduraTexture = new THREE.TextureLoader().load('textures/moldura.jpg');
        this.quadroMaterial = new THREE.MeshLambertMaterial({ map: this.molduraTexture });

        // Material para o quadro bárbara 
        this.barbaraTexture = new THREE.TextureLoader().load('textures/202004695.jpg');
        this.barbaraMaterial = new THREE.MeshLambertMaterial({ map: this.barbaraTexture });

        // Material para o quadro luis 
        this.luisTexture = new THREE.TextureLoader().load('textures/202006464.jpg');
        this.luisMaterial = new THREE.MeshLambertMaterial({ map: this.luisTexture });

        // Material para as janelas
        this.janelaTexture = new THREE.TextureLoader().load('textures/janela.jpg');
        this.janelaMaterial = new THREE.MeshLambertMaterial({ map: this.janelaTexture });

        // Material para a frame das janelas
        this.janelaFrameTexture = new THREE.TextureLoader().load('textures/moldura.jpg');
        this.janelaFrameMaterial = new THREE.MeshLambertMaterial({ map: this.janelaFrameTexture });

        // Material para a porta 
        this.portaTexture = new THREE.TextureLoader().load('textures/porta.jpg');
        this.portaMaterial = new THREE.MeshLambertMaterial({ map: this.portaTexture });

        //Material para a jarra
        this.jarraTexture = new THREE.TextureLoader().load( 'textures/jarra.jpg' );
        this.jarraTexture.wrapS = this.jarraTexture.wrapT = THREE.MirroredRepeatWrapping;
        this.jarraTexture.anisotropy = 16;
        this.jarraTexture.colorSpace = THREE.SRGBColorSpace;
        this.jarraMaterial = new THREE.MeshPhongMaterial({ color: "#FFFFFF",side: THREE.DoubleSide, map: this.jarraTexture });
        
        //Material para o jornal
        this.jornalTexture = new THREE.TextureLoader().load( 'textures/jornal.jpg' );
        this.jornalTexture.wrapS = this.jornalTexture.wrapT = THREE.MirroredRepeatWrapping;
        this.jornalTexture.anisotropy = 16;
        this.jornalTexture.colorSpace = THREE.SRGBColorSpace;
        this.jornalMaterial = new THREE.MeshPhongMaterial({ color: "#FFFFFF",side: THREE.DoubleSide, map: this.jornalTexture });



        this.builder = new MyNurbsBuilder()

        this.meshes = []
        this.samplesU = 24         // maximum defined in MyGuiInterface
        this.samplesV = 24         // maximum defined in MyGuiInterface

        this.mapSize = 1024
    }

    // Deletes the contents of the line if it exists and recreates them
    recompute() {
        if (this.mola !== null) this.app.scene.remove(this.mola)
        this.buildMola()
    
        if (this.carochaGroup !== null) this.app.scene.remove(this.carochaGroup)
        this.buildCarochaQuadro()
    }

    buildMola() {
        const numCircles = 10;  
        const numPointsPerCircle = 100; 
        let radius = 0.10; 
        const height = 0.5; 

        let points = []
        
        // compute the necessary points
        for (let i = 0; i < numCircles; i++) {
            let angleIncrement = (2 * Math.PI) / numPointsPerCircle;
            for (let j = 0; j < numPointsPerCircle; j++) {
                let x = radius * Math.cos(j * angleIncrement);
                let y = radius * Math.sin(j * angleIncrement);
                let z = (i / numCircles) * height;
                points.push(new THREE.Vector3(x, y, z));
            }
        }

        // define geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // create the line from material and geometry
        this.mola = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x777777 }));

        this.mola.position.set(-2.5, 3, -0.8);
        this.mola.rotation.set(Math.PI/2, 0,Math.PI/2);
        this.app.scene.add(this.mola);
    }

    buildCarocha() {
        this.lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } )
        
        //Back Curve
        let r = 0.8;
        let points = [
            new THREE.Vector3(-r, 0, 0), // starting point
            new THREE.Vector3(-r, r * 4 * (Math.sqrt(2) - 1) / 3, 0), // control point 1
            new THREE.Vector3(-r * 4 * (Math.sqrt(2) - 1) / 3, r, 0), // control point 2
            new THREE.Vector3(0, r, 0)  // ending point
        ];

        let position = new THREE.Vector3(0,0,0)
        let curve = new THREE.CubicBezierCurve3( points[0], points[1], points[2], points[3])
        let sampledPoints = curve.getPoints( this.numberOfSamples );
    
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints( sampledPoints )
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(position.x,position.y,position.z)
    
        this.carochaGroup.add( this.lineObj );

        //Front Curve
        r = 0.4;
        points = [
            new THREE.Vector3(r, 0, 0), // starting point
            new THREE.Vector3(r, r * 4 * (Math.sqrt(2) - 1) / 3, 0), // control point 1
            new THREE.Vector3(r * 4 * (Math.sqrt(2) - 1) / 3, r, 0), // control point 2
            new THREE.Vector3(0, r, 0)  // ending point
        ];

        position = new THREE.Vector3(0,r,0)
        curve = new THREE.CubicBezierCurve3( points[0], points[1], points[2], points[3])
        sampledPoints = curve.getPoints( this.numberOfSamples );
    
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints( sampledPoints )
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(position.x,position.y,position.z)
    
        this.carochaGroup.add( this.lineObj );

        //Capô Curve
        position = new THREE.Vector3(0.4, 0, 0)
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(position.x,position.y,position.z)
    
        this.carochaGroup.add( this.lineObj );

        //Back Wheel Curve
        r = 0.3;
        points = [
            new THREE.Vector3(-r, 0, 0), // starting point
            new THREE.Vector3(-r, r * 4/3, 0), // control point 1
            new THREE.Vector3(r, r * 4/3, 0), // control point 2
            new THREE.Vector3(r, 0, 0) // ending point
        ];

        position = new THREE.Vector3(-0.5, 0, 0)
        curve = new THREE.CubicBezierCurve3( points[0], points[1], points[2], points[3])
        sampledPoints = curve.getPoints( this.numberOfSamples );
    
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints( sampledPoints )
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(position.x,position.y,position.z)
    
        this.carochaGroup.add( this.lineObj );

        //Front Wheel Curve
        position = new THREE.Vector3(0.5, 0, 0)

        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(position.x,position.y,position.z)
    
        this.carochaGroup.add( this.lineObj );

    }

    buildBolo() {
        let cylinderBolo = new THREE.CylinderGeometry(0.7, 0.7, 0.35, 64, 1, false, 0, 3 * Math.PI / 2);

        this.boloMesh = new THREE.Mesh(cylinderBolo, [this.boloExtMaterial, this.boloTopoMaterial]);
        this.boloMesh.position.set(0, 5, 0)

        let plane = new THREE.PlaneGeometry(0.7, 0.35);
        this.fatiaIntMesh = new THREE.Mesh(plane, this.boloIntMaterial);
        this.fatiaIntMesh.rotation.set(0, -Math.PI / 2, 0);
        this.fatiaIntMesh.position.set(0, 0, 0.35);

        this.fatiaIntTwoMesh = new THREE.Mesh(plane, this.boloIntMaterial);
        this.fatiaIntTwoMesh.position.set(-0.35, 0, 0);

        this.boloMesh.add(this.fatiaIntMesh);
        this.boloMesh.add(this.fatiaIntTwoMesh);

        this.buildVela();
        this.boloMesh.add(this.velaMesh); // velas are part of the bolo
        this.boloMesh.add(this.velaMeshTwo);
        this.boloMesh.position.set(0, 0.2, 0);
        this.boloMesh.receiveShadow = true;
        this.boloMesh.castShadow = true;
        this.app.scene.add(this.boloMesh);
    }

    buildMesa() {
        this.group = new THREE.Group();

        let box = new THREE.BoxGeometry(5 * this.boxMeshSize, 2 * this.boxMeshSize, 0.25 * this.boxMeshSize);
        this.boxMesh = new THREE.Mesh(box, this.tampoMaterial);
        this.boxMesh.rotation.x = -Math.PI / 2;
        this.boxMesh.position.y = this.boxDisplacement.y;

        let cylinder = new THREE.CylinderGeometry(0.25 * this.boxMeshSize, 0.25 * this.boxMeshSize, 2.5 * this.boxMeshSize);

        this.cylinderMeshOne = new THREE.Mesh(cylinder, this.pernasMaterial);
        this.cylinderMeshOne.castShadow = true;
        this.cylinderMeshOne.receiveShadow = true;
        this.cylinderMeshTwo = this.cylinderMeshOne.clone();
        this.cylinderMeshThree = this.cylinderMeshOne.clone();
        this.cylinderMeshFour = this.cylinderMeshOne.clone();

        this.cylinderMeshOne.position.set(3 * this.boxMeshSize, 1.25 * this.boxMeshSize, -this.boxMeshSize);
        this.cylinderMeshTwo.position.set(3 * this.boxMeshSize, 1.25 * this.boxMeshSize, this.boxMeshSize);
        this.cylinderMeshThree.position.set(-3 * this.boxMeshSize, 1.25 * this.boxMeshSize, this.boxMeshSize);
        this.cylinderMeshFour.position.set(-3 * this.boxMeshSize, 1.25 * this.boxMeshSize, -this.boxMeshSize);

        this.boxMesh.scale.set(1.5, 1.5, 1.5);
        this.boxMesh.receiveShadow = true;
        this.boxMesh.castShadow = true;

        this.buildPrato(); 
        this.buildChapeu(); 
        this.group.add(this.boxMesh);
        this.group.add(this.pratoMesh); // prato must be a part of the mesa
        this.group.add(this.chapeuMesh); // chapeus are part of the mesa
        this.group.add(this.chapeuMeshTwo);
        this.group.add(this.chapeuMeshFour);
        this.group.add(this.cylinderMeshOne);
        this.group.add(this.cylinderMeshTwo);
        this.group.add(this.cylinderMeshThree);
        this.group.add(this.cylinderMeshFour);
    }

    buildVela() {
        let cylinder1 = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
        let cylinder = new THREE.CylinderGeometry();

        this.velaMesh = new THREE.Mesh(cylinder1, this.velaMaterial);
        this.velaMesh.position.set(-0.20, 0.35, -0.25);

        let cone = new THREE.ConeGeometry();

        this.chamaMesh = new THREE.Mesh(cylinder, this.chamaMaterial);
        this.chamaMesh.scale.set(0.02, 0.03, 0.02);
        this.chamaMesh.position.set(0, 0.245, 0);
        this.chamaMesh.castShadow = true;

        this.bottomchamaMesh = new THREE.Mesh(cone, this.chamaMaterial);
        this.bottomchamaMesh.position.set(0, -1, 0);
        this.bottomchamaMesh.scale.set(1, -1, 1);
        this.chamaMesh.add(this.bottomchamaMesh);

        this.topchamaMesh = new THREE.Mesh(cone, this.chamaMaterial);
        this.topchamaMesh.position.set(0, 1, 0);
        this.chamaMesh.add(this.topchamaMesh);
        this.velaMesh.add(this.chamaMesh);
        this.velaMesh.castShadow = true;

        this.chamaMeshTwo = this.chamaMesh.clone();
        this.velaMeshTwo = this.velaMesh.clone();
        this.velaMeshTwo.position.set(0.20, 0.35, 0.15);
        this.velaMeshTwo.castShadow = true;
        this.velaMeshTwo.add(this.chamaMeshTwo);
    }

    buildPrato() {
        let cylinder2 = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 64);
        this.pratoMesh = new THREE.Mesh(cylinder2, this.pratoMaterial);
        this.pratoMesh.position.set(0, 2.6, 0);
        this.pratoMesh.receiveShadow = true;
        this.pratoMesh.castShadow = true;
        this.buildBolo(); 

        this.pratoMesh.add(this.boloMesh); // bolo must be a part of the prato
    }

    buildChapeu() {
        let cone = new THREE.ConeGeometry(0.2, 0.5);
        this.chapeuMesh = new THREE.Mesh(cone, this.chapeuMaterial);
        this.chapeuMesh.castShadow = true;
        this.chapeuMesh.position.set(2.8, 2.9, -1);
        this.chapeuMeshTwo = this.chapeuMesh.clone();
        this.chapeuMeshTwo.position.set(3.1, 2.9, -0.6);
        this.chapeuMeshFour = this.chapeuMesh.clone();
        this.chapeuMeshFour.position.set(2.4, 2.9, -0.6);

        this.chapeuMesh.scale.set(1.25, 1.25, 1.25);
        this.chapeuMeshTwo.scale.set(1.25, 1.25, 1.25);
        this.chapeuMeshFour.scale.set(1.25, 1.25, 1.25);
    }

    buildCarochaQuadro() {
        let box = new THREE.BoxGeometry();
        this.carochaGroup = new THREE.Group();

        this.carochaQuadro = new THREE.Mesh(box, this.quadroMaterial);
        this.carochaQuadro.scale.set(3, 2, 0.01);
        this.carochaQuadro.position.set(0, 0.4, -0.01);

        this.buildCarocha();
        this.carochaGroup.add(this.carochaQuadro);

        this.carochaGroup.position.set(-12.4, 4, 0);
        this.carochaGroup.rotation.set(0, Math.PI/2, 0);
        this.carochaGroup.scale.set(2, 2, 2);
        this.app.scene.add(this.carochaGroup);
    }

    buildQuadro() {
        let box = new THREE.BoxGeometry();
        
        //Quadro da Bárbara
        this.quadroMesh = new THREE.Mesh(box, this.quadroMaterial);
        this.quadroMesh.scale.set(3.5, 3.85, 0.05);
        this.quadroMesh.position.set(-2.5, 4, -12.5);
        this.fotoBarbaraMesh = new THREE.Mesh(box, this.barbaraMaterial);
        this.fotoBarbaraMesh.scale.set(0.8, 0.8, 1);
        this.fotoBarbaraMesh.position.set(0, 0, 0.5)
        this.quadroMesh.add(this.fotoBarbaraMesh);

        //Quadro do Luís
        this.quadroMeshTwo = this.quadroMesh.clone();
        this.quadroMeshTwo.position.set(2.5, 4, -12.5);
        this.fotoLuisMesh = new THREE.Mesh(box, this.luisMaterial);
        this.fotoLuisMesh.scale.set(0.8, 0.8, 1);
        this.fotoLuisMesh.position.set(0, 0, 0.5);
        this.quadroMeshTwo.add(this.fotoLuisMesh);
        
        this.app.scene.add(this.quadroMesh);
        this.app.scene.add(this.quadroMeshTwo);
    }

    buildChair() {
        this.chairGroup = new THREE.Group();

        let base = new THREE.BoxGeometry();
        this.baseMesh = new THREE.Mesh(base, this.cadeiraLadosMaterial);
        this.baseMesh.scale.set(0.99, 0.1, 0.99);
        this.baseMesh.castShadow = true;
        this.baseMesh.receiveShadow = true;

        this.chairGroup.add(this.baseMesh);

        this.legMesh = new THREE.Mesh(base, this.cadeiraMaterial);
        this.legMesh.scale.set(0.2, 1, 0.2);
        this.legMesh.position.set(0.4, -0.5, -0.4);
        this.legMesh.castShadow = true;

        this.legMesh2 = this.legMesh.clone();
        this.legMesh2.position.set(-0.4, -0.5, -0.4);
        this.legMesh2.castShadow = true;

        this.legMesh3 = new THREE.Mesh(base, this.cadeiraMaterial);
        this.legMesh3.scale.set(0.2, 2.5, 0.2);
        this.legMesh3.position.set(0.4, 0.25, 0.4);
        this.legMesh3.castShadow = true;

        this.legMesh4 = this.legMesh3.clone();
        this.legMesh4.position.set(-0.4, 0.25, 0.4);
        this.legMesh4.castShadow = true;

        this.backMesh = new THREE.Mesh(base, this.cadeiraLadosMaterial);
        this.backMesh.scale.set(0.8, 1.3, 0.1);
        this.backMesh.position.set(0, 0.65, 0.4);
        this.backMesh.castShadow = true;

        this.chairGroup.add(this.legMesh);
        this.chairGroup.add(this.legMesh2);
        this.chairGroup.add(this.legMesh3);
        this.chairGroup.add(this.legMesh4);
        this.chairGroup.add(this.backMesh);

        this.chairGroupTwo = this.chairGroup.clone();
        this.chairGroupTwo.position.set(0, 1.5, 2);
        this.chairGroupTwo.scale.set(2, 1.5, 2);

        this.chairGroupThree = this.chairGroup.clone();
        this.chairGroupThree.position.set(4.5, 1.5, 0);
        this.chairGroupThree.rotation.set(0, Math.PI / 2, 0);
        this.chairGroupThree.scale.set(2, 1.5, 2);

        this.chairGroupFour = this.chairGroup.clone();
        this.chairGroupFour.position.set(-4.5, 1.5, 0);
        this.chairGroupFour.rotation.set(0, -Math.PI / 2, 0);
        this.chairGroupFour.scale.set(2, 1.5, 2);

        this.chairGroup.position.set(0, 1.5, -2);
        this.chairGroup.scale.set(2, 1.5, -2);
        this.app.scene.add(this.chairGroupFour);

        this.app.scene.add(this.chairGroupThree);
        this.app.scene.add(this.chairGroupTwo);
        this.app.scene.add(this.chairGroup);
    }

    buildJanela() {
        let janela = new THREE.BoxGeometry();
        this.janelaMesh = new THREE.Mesh(janela, this.janelaFrameMaterial); // frame mesh
        this.janelaIntMesh = new THREE.Mesh(janela, this.janelaMaterial); // interior window mesh
        this.janelaIntMesh.scale.set(0.8, 0.8, 1);
        this.janelaIntMesh.position.set(0, 0, 0.2);
        this.janelaMesh.add(this.janelaIntMesh);
    }

    buildPorta() {
        let porta = new THREE.BoxGeometry();
        this.portaMesh = new THREE.Mesh(porta, this.portaMaterial);
    }

    buildWalls() {
        let planefloor = new THREE.PlaneGeometry(25, 25);
        let plane = new THREE.PlaneGeometry(25, 10);
        this.planefloorMesh = new THREE.Mesh(planefloor, this.floorMaterial);
        this.planefloorMesh.rotation.x = -Math.PI / 2;
        this.planefloorMesh.position.y = -0;
        this.planefloorMesh.receiveShadow = true;

        this.planeceilingMesh = new THREE.Mesh(planefloor, this.ceilingMaterial);
        this.planeceilingMesh.rotation.x = Math.PI / 2;
        this.planeceilingMesh.position.y = 10;

        this.planewallOneMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planewallOneMesh.rotation.x = Math.PI;
        this.planewallOneMesh.position.set(0, 5, 12.5);
        this.buildJanela();
        this.janelaMesh.scale.set(8, -8, 0.05);
        this.planewallOneMesh.add(this.janelaMesh); // janela are part of wall

        this.planewallTwoMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planewallTwoMesh.rotation.x = -2 * Math.PI;
        this.planewallTwoMesh.position.set(0, 5, -12.5);
        this.planewallTwoMesh.receiveShadow = true;

        this.planewallThreeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planewallThreeMesh.rotation.y = -Math.PI / 2;
        this.planewallThreeMesh.position.set(12.5, 5, 0);
        this.buildPorta();
        this.portaMesh.scale.set(4, 9, 0.05);
        this.portaMesh.position.set(4, -1, 0);
        this.planewallThreeMesh.add(this.portaMesh); // porta is part of wall

        this.planewallFourMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planewallFourMesh.rotation.y = Math.PI / 2;
        this.planewallFourMesh.position.set(-12.5, 5, 0);
        this.planewallFourMesh.receiveShadow = true;

        this.app.scene.add(this.planefloorMesh);
        this.app.scene.add(this.planeceilingMesh);
        this.app.scene.add(this.planewallOneMesh);
        this.app.scene.add(this.planewallTwoMesh);
        this.app.scene.add(this.planewallThreeMesh);
        this.app.scene.add(this.planewallFourMesh);
    }
    buildJornal() {
        if (this.meshes !== null) {
            for (let i = 0; i < this.meshes.length; i++) {
                this.app.scene.remove(this.meshes[i]);
            }
            this.meshes = [];
        }
    


        let orderU = 2;
        let orderV = 1;
    
        let controlPoints =
        [   // U = 0
            [ // V = 0..2;
                [ -0.5, -2, 0, 1 ],
                [ -0.5, 2, 0, 1 ], 
            ],
            [ // V = 0..2;
                [ 0, -2, -0.7, 1 ],
                [  0, 2, -0.7, 1 ], 
            ],
            [ // V = 0..2;
                [ 0.5, -2, 0, 1 ],
                [  0.5, 2, 0, 1 ], 
            ]
        ];
        
    
    
        let surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.jornalMaterial);
        let mesh = new THREE.Mesh(surfaceData, this.jornalMaterial);
    
        mesh.scale.set(1, 1, 1);
    
        mesh.rotation.set(-Math.PI/2, 0, Math.PI/12);
        mesh.position.set(-2.7, 2.87, 0.7); 
        mesh.scale.set(0.8, 0.3, 0.8);
        this.app.scene.add(mesh);
    }
    
    
    buildJarra() {
        // are there any meshes to remove?
        if (this.meshes !== null) {
            // traverse mesh array
            for (let i=0; i<this.meshes.length; i++) {
                // remove all meshes from the scene
                this.app.scene.remove(this.meshes[i])
            }
            this.meshes = [] // empty the array  
        }


        let orderU = 3
        let orderV = 3

        let controlPoints =
        [   // U = 0
            [ // V = 0..2;
                [ 0, 0, 0, 1 ],
                [  0, 0, 0, 1 ], 
                [  0, 0, 0, 1 ],
                [ 0, 0, 0, 1 ]
            ],

            // U = 1
            [ // V = 0..2;
                [ -1.1, 0, 0, 1 ],
                [  -1.1, 0, -1.35, 1 ], 
                [  1.1, 0, -1.35, 1 ],
                [ 1.1, 0, 0, 1 ]
            ],

            // U = 2
            [ // V = 0..2
                [ 0, 1.7, 0, 3 ],
                [  0, 1.7, 0, 3 ], 
                [  0, 1.7, 0, 3 ],         
                [ 0, 1.7, 0, 3 ]
            ],

            // U = 3
            [ // V = 0..2
                [ -0.2, 2, 0, 1 ],
                [  -0.2, 2, -0.3, 1 ], 
                [  0.2, 2, -0.3, 1 ],         
                [ 0.2, 2, 0, 1 ]
            ]
        ]
        
        this.jarraGroup = new THREE.Group();

        let surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.jarraMaterial)  
        let mesh = new THREE.Mesh( surfaceData, this.jarraMaterial );

        mesh.scale.set( 1,1,1 )

        this.jarraGroup.add( mesh )
        this.meshes.push (mesh)

        let mesh2 = mesh.clone()
        mesh2.scale.set(1, 1, -1)
        this.jarraGroup.add(mesh2)
        this.meshes.push(mesh2)

        this.jarraGroup.position.set(-11, 0, 11);
        this.jarraGroup.scale.set(2, 2, 2);
        this.app.scene.add(this.jarraGroup);
    }

    buildFlower() {
        const geometry = new THREE.SphereGeometry(0.8, 32, 32);

        // Scale the geometry to flatten it along the Y-axis (or any desired axis)
        geometry.scale(2, 0.8, 0.3); // Adjust the scaling factor as needed

        const map = new THREE.TextureLoader().load( 'Textures/petala.jpg' );
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;
        this.material = new THREE.MeshLambertMaterial( { map: map} );

        this.petala = new THREE.Mesh(geometry, this.material);
        this.petala.position.set(1.5, 0, 0);

        this.petala2 = new THREE.Mesh(geometry, this.material);
        this.petala2.rotation.set(0, 0, Math.PI/5);
        this.petala2.position.set(1, 1, 0);

        this.petala3 = new THREE.Mesh(geometry, this.material);
        this.petala3.rotation.set(0, 0, Math.PI/2);
        this.petala3.position.set(0, 1.2, 0);

        this.petala4 = new THREE.Mesh(geometry, this.material);
        this.petala4.rotation.set(0, 0, 6*Math.PI/7);
        this.petala4.position.set(-1.1, 0.8, 0);

        this.petala5 = new THREE.Mesh(geometry, this.material);
        this.petala5.rotation.set(0, 0, 11*Math.PI/10);
        this.petala5.position.set(-1, -0.5, 0);

        this.petala6 = new THREE.Mesh(geometry, this.material);
        this.petala6.rotation.set(0, 0, 14*Math.PI/10);
        this.petala6.position.set(-0.1, -1, 0);

        this.petala7 = new THREE.Mesh(geometry, this.material);
        this.petala7.rotation.set(0, 0, -Math.PI/4);
        this.petala7.position.set(0.9, -0.9, 0);

        this.sphereGeometry = new THREE.SphereGeometry();
        this.centerTexture = new THREE.TextureLoader().load('Textures/center.jpg');
        this.centerMaterial = new THREE.MeshLambertMaterial({map: this.centerTexture});

        this.centerMesh = new THREE.Mesh(this.sphereGeometry, this.centerMaterial);
        this.centerMesh.scale.set(0.7, 0.7, 0.7);

        this.flowerGroup = new THREE.Group();
        this.flowerGroup.add(this.centerMesh);
        this.flowerGroup.add(this.petala);
        this.flowerGroup.add(this.petala2);
        this.flowerGroup.add(this.petala3);
        this.flowerGroup.add(this.petala4);
        this.flowerGroup.add(this.petala5);
        this.flowerGroup.add(this.petala6);
        this.flowerGroup.add(this.petala7);

        this.buildCaule();

        this.flowerGroup.scale.set(0.2, 0.2, 0.2);
        this.flowerGroup.rotation.set(0, -Math.PI/3, 0);
        this.flowerGroup.position.set(0, 3, 0);

        this.jarraGroup.add(this.flowerGroup);
    }

    buildCaule() {
        let points = [
            new THREE.Vector3( -1, -5, 0.0 ), // starting point
            new THREE.Vector3(    1,  0, 0.0 ), // control point
            new THREE.Vector3(  0, 4, 0.0 )  // ending point
        ]
    
        let position = new THREE.Vector3(0,-4,0)
        
        let curve = new THREE.QuadraticBezierCurve3( points[0], points[1], points[2])
    
        // sample a number of points on the curve
        let sampledPoints = curve.getPoints( 16 );
    
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints( sampledPoints )
    
        this.lineMaterial = new THREE.LineBasicMaterial( { color: "#008000"} )
    
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
    
        this.lineObj.position.set(position.x,position.y,position.z)
    
        this.flowerGroup.add( this.lineObj );   
    }


    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        this.mola = null;
        this.carochaGroup = null;

        this.numberOfSamples = 40;

        this.buildMesa();
        this.buildChair();
        this.buildQuadro();
        this.buildWalls();
        this.buildJarra();
        this.buildJornal();
        this.buildFlower();

        // curve recomputation
        this.recompute();

        // add a point light on top of the model
        this.pointLight = new THREE.PointLight(0xffffff, 40, 0);
        this.pointLight.position.set(0, 10, 0);
        
        this.pointLight.castShadow = true;
        this.pointLight.shadow.mapSize.width = this.mapSize;
        this.pointLight.shadow.mapSize.height = this.mapSize;
        this.pointLight.shadow.camera.near = 0.5;
        this.pointLight.shadow.camera.far = 500;
        this.app.scene.add(this.pointLight);

        this.spotLight = new THREE.SpotLight("#0328ff", 8, 20, 0.12, 0, 0);
        this.spotLight.position.set(6, 10, 0);
        this.spotLight.target = this.boloMesh;

        this.dayhour = 9;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = this.mapSize;
        this.spotLight.shadow.mapSize.height = this.mapSize;
        this.spotLight.shadow.camera.near = 0.5;
        this.spotLight.shadow.camera.far = 100;

        this.app.scene.add(this.spotLight);


        this.directionalLight = new THREE.DirectionalLight(0xfae5aa, 1);
        this.directionalLight.position.set(0, 13, 12.45);
        this.directionalLight.target.position.set(0, 5, 0);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = this.mapSize;
        this.directionalLight.shadow.mapSize.height = this.mapSize;
        this.directionalLight.shadow.camera.left = -4;
        this.directionalLight.shadow.camera.right = 4;
        this.directionalLight.shadow.camera.bottom = -4;
        this.directionalLight.shadow.camera.top = 4;

        
        this.app.scene.add(this.directionalLight);


        // add an ambient light
        this.ambientLight = new THREE.AmbientLight(0x555555, 20);
        this.app.scene.add(this.ambientLight);
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateTampoColor(value) {
        let tampoColor = value
        this.mesaMaterial.color.set(tampoColor)
    }
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }

    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {
            this.app.scene.remove(this.boxMesh)
        }
        //this.buildBox();
        this.buildMesa()
        this.lastBoxEnabled = null
    }

    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.group)
            }
            else {
                this.app.scene.remove(this.group)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y * 1.2
        this.boxMesh.position.z = this.boxDisplacement.z

    }

}

export { MyContents };