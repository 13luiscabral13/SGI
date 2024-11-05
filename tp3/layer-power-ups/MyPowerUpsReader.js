import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyFileReader } from '../parser/MyFileReader.js';
import { SceneGraph } from '../SceneGraph.js';
import { MyPowerUp } from './MyPowerUp.js';

class MyPowerUpsReader {
    /**
       constructs the object
       @param {MyContents} contents The app object
    */
    constructor(app) {
        this.app = app
        this.objs = {}
        
        this.reader = new MyFileReader(app, this, this.onPowerUpsLoaded);
        this.reader.open("./layer-power-ups/power-ups.xml");
    }

    init() {
        
    }

    /**
     * Called when the power-ups xml file load is complete
     * @param {MySceneData} data the entire power-ups data object
     */
    onPowerUpsLoaded(data) {
        this.data = data;
        this.onAfterPowerUpsLoadedAndBeforeRender(data);

        this.updatePowerUpNodes();
    }

    onAfterPowerUpsLoadedAndBeforeRender(data) {
        //Construir os nós dos power-ups
        this.powerUpsGraph = new SceneGraph(data);
        this.rootNode = this.powerUpsGraph.traverseNode(data.nodes['scene']);
    }

    updatePowerUpNodes() {
        for(let i=0; i<this.rootNode.children.length; i++) {
            // Encontrar nome do power up
            const name = this.data.nodes['scene'].children[i].id;

            // Encontrar altura do power up no eixo y
            const height = this.findHeight(this.data.nodes['scene'].children[i].transformations);

            this.objs[name] = new MyPowerUp(name, this.rootNode.children[i], height, this.data.nodes['scene'].children[i].raio);
        }
    }

    // Adicionar power-up à cena
    addPowerUp(name, position) {
        // Obter o grupo e raio do power-up
        const node = this.objs[name].node;
        const raio = this.objs[name].raioEnvolvente;

        // Mudar o power up para as posições x e z na pista
        node.position.x = position[0];
        node.position.z = position[2];
        this.objs[name].setPosition(position);

        //Cria o volume envolvente necessário para a deteção de colisões
        const volume = this.createVolume(this.objs[name], raio);
        this.objs[name].sphere = volume;
        
        this.app.scene.add(node);
        this.app.scene.add(volume);
    }

    // Cria uma esfera envolvente para um dado objeto
    // Esta esfera é usada para detetar colisões
    // Recebe um objeto do tipo MyPowerUp
    createVolume(object, raio) {
        // Criar uma mesh para a esfera (apenas para renderização)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
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
}

export { MyPowerUpsReader };