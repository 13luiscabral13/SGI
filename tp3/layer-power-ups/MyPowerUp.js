import * as THREE from 'three';

class MyPowerUp {
    /**
       constructs the object
       @param {MyContents} scene The scene object
    */
    constructor(name, node, height, raioEnvolvente) {
        this.name = name
        this.node = node
        this.height = height;
        this.raioEnvolvente = raioEnvolvente;
        this.sphere = null;

        this.node.name = name;

        this.xPos = 0;
        this.yPos = height;
        this.zPos = 0;
    }

    init() {
        
    }

    setPosition(position) {
        this.xPos = position[0];
        this.zPos = position[2];
    }
}

export { MyPowerUp };