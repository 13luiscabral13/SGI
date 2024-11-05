import * as THREE from 'three';

class MyRoute {
    /**
       constructs the object
       @param {MyContents} scene The scene object
    */
    constructor(app) {
        this.app = app;

        this.allPositions = [ 
            [33,0.8,4.5],
            [32.5, 0.8, -23.5],
            [-5.5, 0.8, -18.5], 
            [-18, 0.8, -32.5], 
            [19, 0.8, -43], 
            [-1.4, 0.8, -50.5], 
            [-19, 0.8, -72], 
            [-41.5, 0.8, -66], 
            [-46.5, 0.8, -23.5], 
            [-33.5, 0.8, 3], 
            [-4.5, 0.8, 0.5]
        ];

        this.setAllPositionsAvailable();
    }

    init() {
        //ARAMAZENAR OS PONTOS CHAVE DE UMA ROTA
        //ROTA É O PERCURSO PERCORRIDO POR UM CARRO AUTÓNOMO
        //PODEM EXISTIR UMA OU MAIS ROTAS
    }

    setAllPositionsAvailable() {
        this.availablePositions = this.allPositions.slice();

    }

    chooseRandomPosition() {
        // Gere um índice aleatório dentro do intervalo da lista
        const indiceAleatorio = Math.floor(Math.random() * this.availablePositions.length);

        // Use o índice gerado para obter e remover a posição aleatória da lista
        const posicaoAleatoria = this.availablePositions.splice(indiceAleatorio, 1)[0];

        return posicaoAleatoria;
    }

    removePositionFromAvailable(position) {
        // Encontrar o índice da posição a remover
        const indice = this.availablePositions.findIndex( availablePos => {
            return (
                availablePos[0] === position[0] &&
                availablePos[1] === position[1] &&
                availablePos[2] === position[2]
            );
        } );

        // Se o índice for encontrado, remove o elemento da lista
        if(indice !== -1) {
            this.availablePositions.splice(indice, 1);
        } else {
            console.log("Posição não encontrada na lista");
        }
    }

    convertToSelectablePosition(position) {
        // Raio da esfera
        const raio = 0.5;

        // Criação da geometria da esfera
        const geometry = new THREE.SphereGeometry(raio);

        // Material da esfera 
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Cor vermelha

        // Criação da mesh da esfera
        const esferaMesh = new THREE.Mesh(geometry, material);

        // Configura a posição da esfera com base no argumento fornecido
        esferaMesh.position.set(position[0], position[1], position[2]);
        esferaMesh.layers.enable(4);

        // Adiciona a esfera à sua cena
        this.app.scene.add(esferaMesh);

        return esferaMesh;
    }

}

export { MyRoute };