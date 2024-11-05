import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyFileReader } from '../parser/MyFileReader.js';
import { SceneGraph } from '../SceneGraph.js';
import { MyVehicle } from './MyVehicle.js';


class MyVehiclesReader {
    /**
       constructs the object
       @param {MyContents} contents The app object
    */
    constructor(app) {
        this.app = app
        this.objs = {}
        
        this.reader = new MyFileReader(app, this, this.onVehiclesLoaded);
        this.reader.open("./layer-vehicles/vehicles.xml");
    }

    init() {
        
    }

    /**
     * Called when the vehicles xml file load is complete
     * @param {MySceneData} data the entire vehicles data object
     */
    onVehiclesLoaded(data) {
        this.data = data;
        this.onAfterVehiclesLoadedAndBeforeRender(data);

        this.updateVehicleNodes();
    }

    onAfterVehiclesLoadedAndBeforeRender(data) {
        //Construir os nós dos carros
        this.vehiclesGraph = new SceneGraph(data);
        this.rootNode = this.vehiclesGraph.traverseNode(data.nodes['scene']);
    }



    updateVehicleNodes() {
        this.maxSpeed = 2;
        this.aceleration = 0.40;
        this.decelaration = 0.05;

        for(let i=0; i<this.rootNode.children.length; i++) {
            // Encontar o nome do carro
            const name = this.data.nodes['scene'].children[i].id;
            const maxSpeed = this.data.nodes['scene'].children[i].maxSpeed;
            const acceleration = this.data.nodes['scene'].children[i].acceleration;
            const decelaration = this.data.nodes['scene'].children[i].deceleration;
            const raio = this.data.nodes['scene'].children[i].raio;
            
            // Encontrar altura do carro no eixo y
            const height = this.findHeight(this.data.nodes['scene'].children[i].transformations);

            this.objs[name] = new MyVehicle(name, this.rootNode.children[i], height, maxSpeed, acceleration, decelaration, raio, this.app);
        }
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

export { MyVehiclesReader };