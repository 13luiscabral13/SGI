import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyTriangle } from './MyTriangle.js';
import { MyContents } from './MyContents.js';

/**
 *  This class contains the contents of our Scene Graph
 */
class SceneGraph {
    /**
       constructs the object
       @param {MyContents} scene The scene object
    */
    constructor(scene) {
        this.scene = scene;
        this.materialStack = [];
        this.transformationStack = [];
        this.shadowCastTuple = null;
        this.shadowReceiveTuple = null;
        this.nodesDict = {};

        this.defaultMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
        this.materialStack.push(this.defaultMaterial);

        this.matrizIdentidade = new THREE.Matrix4().identity();
        this.transformationStack.push(this.matrizIdentidade);

        this.builder = new MyNurbsBuilder();
    }

    /**
     * traverses recursively all xml nodes
     * @param {*} node the node of the xml to be traversed
     */
    traverseNode(node) {
        if(node.type === "node") {
            if(node.id in this.nodesDict) {
                //Fazer clone desse nó e aplicar as novas transformações ou materiais se existirem
                let cloned = this.nodesDict[node.id].clone();

                this.propagateTransformations(cloned, node);

                return cloned;
            }

            this.nodesDict[node.id] = new THREE.Group();

            //ADICIONAR MATERIAL À STACK
            if(node.materialIds.length === 0) {
                const lastMaterial = this.materialStack[this.materialStack.length - 1];
                this.materialStack.push(lastMaterial);
            }    
            else{
                this.pushMaterial(node.materialIds[0]);
            }

            //ADICIONAR TRANSFORMAÇÕES À STACK
            if(node.transformations.length === 0) {
                const lastTransformation = this.transformationStack[this.transformationStack.length - 1];
                this.transformationStack.push(lastTransformation);
            }
            else {
                this.pushTransformations(node);
            }
            
            
            if (node.castShadows || node.receiveShadows) {
                if (node.receiveShadows && (this.shadowReceiveTuple == null)) {
                    this.shadowReceiveTuple = (true, node.id);
                }
                if (node.castShadows && (this.shadowCastTuple == null)) {
                    this.shadowCastTuple = (true, node.id);
                }
            }


            //Recursively traverse children nodes
            for(let child of node.children) {
                if(child.type==='pointlight' || child.type==='spotlight' || child.type==='directionallight')
                    break;

                let childGroup = this.traverseNode(child);
                this.nodesDict[node.id].add(childGroup);
            }

            if (this.shadowReceiveTuple == (true, node.id)) {
                this.shadowReceiveTuple = null;
            }
            if (this.shadowCastTuple == (true, node.id)) {
                this.shadowCastTuple = null;
            }

            //Retirar material desse nó
            this.materialStack.pop();

            //Retirar a transformação desse nó
            this.transformationStack.pop();

            return this.nodesDict[node.id];
        }
        else if(node.type === "primitive") {
            return this.handlePrimitive(node);
        }
        else if(node.type === "lod") {
            if(node.id in this.nodesDict) {
                //Fazer clone desse nó e aplicar as novas transformações ou materiais se existirem
                let cloned = this.nodesDict[node.id].clone();

                this.propagateTransformations(cloned, node);

                return cloned;
            }

            this.nodesDict[node.id] = new THREE.LOD();

            for(let child of node.children) {
                let mindist = child.mindist;
                let childGroup = this.traverseNode(child.node);
                this.nodesDict[node.id].addLevel(childGroup, mindist);
            }
            
            return this.nodesDict[node.id];
        }
    }

    /**
     * Clones a group when the corresponding node is referenced again
     * Propagates recursively transformations and materials to its children
     * @param {*} cloned Group Object to be cloned
     * @param {*} node Node of the xml corresponding to the cloned group
     */
    propagateTransformations(cloned, node) {
        if(node.type === "node") {
            //ADICIONAR MATERIAL À STACK
            if(node.materialIds.length === 0) {
                const lastMaterial = this.materialStack[this.materialStack.length - 1];
                this.materialStack.push(lastMaterial);
            }    
            else{
                this.pushMaterial(node.materialIds[0]);
            }

            //ADICIONAR TRANSFORMAÇÕES À STACK
            if(node.transformations.length === 0) {
                const lastTransformation = this.transformationStack[this.transformationStack.length - 1];
                this.transformationStack.push(lastTransformation);
            }
            else {
                this.pushTransformations(node);
            }

            //Recursively traverse children nodes
            for(let i=0; i<node.children.length; i++) {
                this.propagateTransformations(cloned.children[i], node.children[i])
            }

            //Retirar a transformação desse nó
            this.transformationStack.pop();

            this.materialStack.pop();
        } 
        else if(node.type === "primitive") {
            cloned.position.set(0, 0, 0);
            cloned.scale.set(1, 1, 1);
            cloned.rotation.set(0, 0, 0);
            cloned.applyMatrix4(this.transformationStack[this.transformationStack.length - 1]);
            cloned.children[0].material = this.materialStack[this.materialStack.length - 1];
            cloned.children[0].material.needsUpdate = true;
        }
        else if(node.type === "lod") {
            for(let i=0; i<node.children; i++) {
                this.propagateTransformations(cloned.children[i], node.children[i].node);
            }
        }   
    }

    /**
     * Create primitive of that node
     * Apply the material on the top of the materials stack
     * Apply the transformation on the top of the transformations stack
     * @param {*} node Node of the xml corresponding to a primitive
     */
    handlePrimitive(node) {
        let group = new THREE.Group();
        let mesh=null;

        if(node.subtype === "rectangle") {
            const width = Math.abs(node.representations[0].xy2[0] - node.representations[0].xy1[0]);
            const height = Math.abs(node.representations[0].xy2[1] - node.representations[0].xy1[1]);

            const plane = new THREE.PlaneGeometry(width, height, node.representations[0].parts_x, node.representations[0].parts_y);
            mesh = new THREE.Mesh(plane, this.materialStack[this.materialStack.length - 1]);

            // Configurar a posição do mesh de acordo com o canto inferior esquerdo
            mesh.position.set(node.representations[0].xy1[0] + width / 2, node.representations[0].xy1[1] + height / 2, 0);
        }
        else if(node.subtype === "triangle") {
            const info = node.representations[0];
            const v1 = new THREE.Vector3(info.xyz1[0], info.xyz1[1], info.xyz1[2]);
            const v2 = new THREE.Vector3(info.xyz2[0], info.xyz2[1], info.xyz2[2]);
            const v3 = new THREE.Vector3(info.xyz3[0], info.xyz3[1], info.xyz3[2]);

            const triangle = new MyTriangle(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
            
            mesh = new THREE.Mesh(triangle, this.materialStack[this.materialStack.length - 1]);
        }
        else if(node.subtype === "cylinder") {
            const info = node.representations[0];

            const cylinder = new THREE.CylinderGeometry(info.top, info.base, info.height, info.slices, info.stacks, info.capsclose, info.thetaStart, info.thetaLength);
            mesh = new THREE.Mesh(cylinder, this.materialStack[this.materialStack.length - 1]);
        }

        else if(node.subtype === "sphere") {
            const info = node.representations[0];

            const sphere = new THREE.SphereGeometry(info.radius, info.slices, info.stacks, info.phistart, info.philength, info.thetastart, info.thetalength);

            mesh = new THREE.Mesh(sphere, this.materialStack[this.materialStack.length - 1]);
        }
        else if(node.subtype === "box") {
            const info = node.representations[0];

            const width = Math.abs(info.xyz2[0] - info.xyz1[0]);
            const height = Math.abs(info.xyz2[1] - info.xyz1[1]);
            const depth = Math.abs(info.xyz2[2] - info.xyz1[2]);

            // Calcular o centro da caixa
            const centerX = (info.xyz1[0] + info.xyz2[0]) / 2;
            const centerY = (info.xyz1[1] + info.xyz2[1]) / 2;
            const centerZ = (info.xyz1[2] + info.xyz2[2]) / 2;

            const box = new THREE.BoxGeometry(width, height, depth, info.parts_x, info.parts_y, info.parts_z);

            mesh = new THREE.Mesh(box, this.materialStack[this.materialStack.length - 1]);

            // Definir a posição do mesh para que o centro da caixa coincida com o ponto calculado
            mesh.position.set(centerX, centerY, centerZ);
        }
        else if (node.subtype === "polygon") {
            const info = node.representations[0];
            const radius = info.radius;
            const stacks = info.stacks;
            const slices = info.slices;
            const color_c = info.color_c;
            const color_p = info.color_p;
            var phi = 0;
            var theta = 0;
            var phiInc = Math.PI / stacks;
            var thetaInc = (2 * Math.PI) / slices;
            var latVertices = slices + 1;
            // Crie a geometria do buffer
            const geometry = new THREE.BufferGeometry();

            // Create buffers
            const vertices = [];
            const colors = [];
            const normals = [];
            const indices = [];
        
            for (let stack = 0; stack <= stacks; stack++) {
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
                theta = 0;
                for (let slice = 0; slice <= slices; slice++) {
                    //--- Vertices coordinates
                    var x = radius * Math.cos(theta) * sinPhi;
                    var y = radius * cosPhi;
                    var z = radius * Math.sin(-theta) * sinPhi;
                    vertices.push(x, y, z);

                    //Indices
                    if (stack < stacks && slice < slices) {
                        var current = stack * latVertices + slice;
                        var next = current + latVertices;

                        indices.push( current + 1, current, next);
                        indices.push( current + 1, next, next +1);
                    }

                    normals.push(x, y, z);

                    //Cores
                    const alpha = Math.abs(stack - stacks / 2) / (stacks / 2);
                    const r = (1 - alpha) * color_c.r + alpha * color_p.r;
                    const g = (1 - alpha) * color_c.g + alpha * color_p.g;
                    const b = (1 - alpha) * color_c.b + alpha * color_p.b;
                    colors.push(r, g, b);

                    theta += thetaInc;
                }
                phi += phiInc;
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setIndex(indices);

            geometry.computeBoundingSphere();

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
                transparent: false,
            });

            // Create the mesh
            mesh = new THREE.Mesh(geometry, material);
        }
        else if(node.subtype === "nurbs") {
            const info = node.representations[0];

            let orderU = info.degree_u;
            let orderV = info.degree_v;
            let samplesU = info.parts_u;
            let samplesV = info.parts_v;

            let controlPoints = [];

            let count=0;

            for(let i=0; i<=orderU; i++) {
                controlPoints[i] = [];
                for(let j=0; j<=orderV; j++) {
                    let controlPoint = info.controlpoints[count];
                    controlPoints[i].push([controlPoint.xx, controlPoint.yy, controlPoint.zz, 1]);
                    count++;
                }
            }
            
            let surfaceData = this.builder.build(controlPoints, orderU, orderV, samplesU, samplesV, this.materialStack[this.materialStack.length - 1])  
            mesh = new THREE.Mesh( surfaceData, this.materialStack[this.materialStack.length - 1] );
        }

        if (this.shadowCastTuple != null) {
            mesh.castShadow = true;
        }
        if (this.shadowReceiveTuple != null) {
            mesh.receiveShadow = true;
        }
        group.add(mesh);
        group.applyMatrix4(this.transformationStack[this.transformationStack.length - 1]);
        return group;
    }

    /**
     * Multiply all matrices corresponding to transformations
     * Multiply the resulting matrix by its father transformation matrix
     * Push resulting matrix to transformation stack
     * @param {*} node Node of the xml to calculate transformations
     */
    pushTransformations(node) {
        const fatherMatrix = this.transformationStack[this.transformationStack.length - 1];
    
        let matrizFinal = new THREE.Matrix4();

        for (let transformation of node.transformations) {
            let matrizTransformacao = new THREE.Matrix4();

            if (transformation.type === 'T') {
                matrizTransformacao.makeTranslation(transformation.translate[0], transformation.translate[1], transformation.translate[2]);
            } else if (transformation.type === 'R') {
                const rotationX = transformation.rotation[0];
                const rotationY = transformation.rotation[1];
                const rotationZ = transformation.rotation[2];
                matrizTransformacao.makeRotationX(rotationX);
                matrizTransformacao.multiply(new THREE.Matrix4().makeRotationY(rotationY));
                matrizTransformacao.multiply(new THREE.Matrix4().makeRotationZ(rotationZ));
            } else if (transformation.type === 'S') {
                matrizTransformacao.makeScale(transformation.scale[0], transformation.scale[1], transformation.scale[2]);
            }

            // Multiplica a matriz de transformação atual à matriz acumulada
            matrizFinal.multiply(matrizTransformacao);
        }
    
        // Calcular a matriz resultante
        const resultMatrix = new THREE.Matrix4().multiplyMatrices(fatherMatrix, matrizFinal);
        this.transformationStack.push(resultMatrix);
    }
    
    /**
     * Push material to materials stack
     * @param {*} node Node of the xml to push material
     */
    pushMaterial(materialId) {
        let material = this.scene.materialsDict[materialId];
        if(!material) {
            this.materialStack.push(this.defaultMaterial);
        }
        else {
            this.materialStack.push(material);
        }
    }


}

export {SceneGraph};