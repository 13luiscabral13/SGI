import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyFileReader } from '../parser/MyFileReader.js';
import { SceneGraph } from '../SceneGraph.js';
import { MyObstacle } from './MyObstacle.js';
import { MyShader } from '../MyShader.js';


class MyObstaclesReader {
    /**
       constructs the object
       @param {MyContents} contents The app object
    */
    constructor(app) {
        this.app = app
        this.objs = {}
        this.tracksObstacles = {};
        this.copyCounter = 0;
        
        // load second texture
        const tiretexture = new THREE.TextureLoader().load('textures/tire.jpg' )
        const oiltexture = new THREE.TextureLoader().load('textures/waterMap.jpg' )
        this.shaders = [
            new MyShader(this.app, 'Tire Shader', "Increasing and decreasing tire size", "shaders/pneu.vert", "shaders/pneu.frag", {
            uSampler: {type: 'sampler2D', value: tiretexture },
            normScale: {type: 'f', value: 1.0 },
            displacement: {type: 'f', value: 0 },
            normalizationFactor: {type: 'f', value: 0 },
            timeFactor: {type: 'f', value: 0.0 },
            scale: {type: 'f', value: 1.0 },
        }),
            new MyShader(this.app, 'Blend textures animated', "load two texture and blend them. Displace them by time   ", "shaders/oil.vert", "shaders/oil.frag", {
            uSampler1: {type: 'sampler2D', value: oiltexture },
            uSampler2: {type: 'sampler2D', value: tiretexture },
            normScale: {type: 'f', value: 0.1 },
            displacement: {type: 'f', value: 0.0 },
            normalizationFactor: {type: 'f', value: 1 },
            blendScale: {type: 'f', value: 1 },
            timeFactor: {type: 'f', value: 0.0 },
        })

    ];


        
        this.reader = new MyFileReader(app, this, this.onObstaclesLoaded);
        this.reader.open("./layer-obstacles/obstacles.xml");
    }

    init() {
        
    }

    /**
     * Called when the obstacles xml file load is complete
     * @param {MySceneData} data the entire obstacles data object
     */
    onObstaclesLoaded(data) {
        this.data = data;
        this.onAfterObstaclesLoadedAndBeforeRender(data);

        this.updateObstacleNodes();
    }

    onAfterObstaclesLoadedAndBeforeRender(data) {
        //Construir os nós dos obstáculos
        this.obstaclesGraph = new SceneGraph(data);
        this.rootNode = this.obstaclesGraph.traverseNode(data.nodes['scene']);
    }

    updateObstacleNodes() {
        for(let i=0; i<this.rootNode.children.length; i++) {
            // Encontrar nome do obstáculo
            const name = this.data.nodes['scene'].children[i].id;

            // Encontrar altura do obstáculo no eixo y
            const height = this.findHeight(this.data.nodes['scene'].children[i].transformations);

            this.objs[name] = new MyObstacle(name, this.rootNode.children[i], height, this.data.nodes['scene'].children[i].raio);
        }
    }

    // Cria um novo obstáculo na pista
    // Não adiciona à cena
    // Adiciona apenas à lista de obstáculos da pista
    createNewObstacle(name, position) {
        let obj = this.objs[name];
        if (obj.name === 'tires') {
            let group = obj.node;
            for (let child of group.children) {
                let group_with_mesh = child.children[0];
                let mesh = group_with_mesh.children[0];
                mesh.material = this.shaders[0].material;
                mesh.material.needsUpdate = true;
            }

        }
        if (obj.name === 'oil_spill') {
            let group = obj.node;
            for (let child of group.children) {
                let group_with_mesh = child.children[0];
                let mesh = group_with_mesh.children[0];
                mesh.material = this.shaders[1].material;
                mesh.material.needsUpdate = true;
            }
        }

        // Verificar se já existe um obstáculo com esse nome em pista
        if(name in this.tracksObstacles) {
            // Gera um nome diferente
            name = name + '_copy' + this.copyCounter;
            const newObstacleNode = obj.node.clone();
            this.copyCounter++;

            // Cria o novo obstáculo na posição desejada
            const newObstacle = new MyObstacle(name, newObstacleNode, obj.height, obj.raioEnvolvente);
            newObstacle.setPosition(position);
            newObstacleNode.position.x = position[0];
            newObstacleNode.position.z = position[2];

            // Cria o volume envolvente necessário para a deteção de colisões
            let newObstacleSphere = this.createVolume(newObstacle, newObstacle.raioEnvolvente);
            newObstacle.sphere = newObstacleSphere;

            // Adiciona o obstáculo à lista de obstáculos da pista
            this.tracksObstacles[name] = newObstacle;
        } else {
            obj.setPosition(position);
            obj.node.position.x = position[0];
            obj.node.position.z = position[2];

            let objSphere = this.createVolume(obj, obj.raioEnvolvente);
            obj.sphere = objSphere;
            this.tracksObstacles[name] = obj;
        }
    }

    // Adicionar um obstáculo à cena
    // Recebe um objeto do tipo MyObstacle
    // Se for para adicionar à pista, adiciona também a esfera envolvente
    addObstacleToScene(obj, addToTrack) {
        this.app.scene.add(obj.node);

        if(addToTrack) {
            this.app.scene.add(obj.sphere);
        }
        
    }

    removeObstaclesFromScene() {
        for(var name in this.objs) {
            let node = this.objs[name].node;
            let sphere = this.objs[name].sphere;

            if(sphere !== null) {
                this.app.scene.remove(sphere);
            }

            this.app.scene.remove(node);
        }

        for(var name in this.tracksObstacles) {
            let node = this.tracksObstacles[name].node;
            let sphere = this.tracksObstacles[name].sphere;

            if(sphere !== null) {
                this.app.scene.remove(sphere);
            }

            this.app.scene.remove(node);
        }
    }

    // Cria uma esfera envolvente para um dado objeto
    // Esta esfera é usada para detetar colisões
    createVolume(object, raio) {
        // Criar uma mesh para a esfera (apenas para renderização)
        let material;
        material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        material.visible = false;
        const esferaMesh = new THREE.Mesh(new THREE.SphereGeometry(raio, 32, 32), material);
        esferaMesh.position.set(object.xPos, object.yPos, object.zPos);

        return esferaMesh;
    }

    // Função para filtrar objetos com type igual a 'T'
    findHeight(transformations) {
        // Encontrar a transformação do tipo 'T' (se existir)
        const transformacaoTipoT = transformations.find(transformacao => transformacao.type === 'T');

        // Obter o segundo valor da propriedade translate correspondente à coordenada y
        const coordenadaY = transformacaoTipoT ? transformacaoTipoT.translate[1] : 0;
        return coordenadaY;
    }

    updateShader(t) {
            // Calculate the value for normScale based on a cycle
            const cycleDuration = 1; // Duration of the cycle in seconds
            const normScaleMin = 1; // Minimum value for normScale
            const normScaleMax = 1.5; // Maximum value for normScale
            const normScaleRange = normScaleMax - normScaleMin;
            const normScaleCycle = (Math.sin(t * Math.PI * 2 / cycleDuration) + 1) / 2; // Calculate the value for normScale in the range [0, 1]
            const normScale = normScaleMin + normScaleRange * normScaleCycle;

            this.shaders[0].updateUniformsValue("scale", normScale);

            this.shaders[1].updateUniformsValue("timeFactor", t);
    }
}

export { MyObstaclesReader };