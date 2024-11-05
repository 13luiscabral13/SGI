import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

class MyVehicle {
    /**
       constructs the object
       @param {MyContents} scene The scene object
    */
    constructor(name, node, height, maxSpeed, acceleration, decelaration, raioEnvolvente, app) {
        this.app = app;
        this.name = name
        this.node = node
        this.node.name = name;
        this.height = height;
        this.raioEnvolvente = raioEnvolvente;
        this.sphere = null;
        this.inTrack = true;
        this.currentVehicleCamera = 0;
        this.rearView = false;
        this.maxSpeed = maxSpeed;
        this.maxPossibleSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.decelaration = decelaration;
        this.canMove = false;
        this.velocity = new THREE.Vector3();
        this.accelerating = false;
        this.reversing = false;
        this.freeCamera = false;
        this.wheelFL = this.findChildByName(node, name + "_wheelFL");
        this.wheelFR = this.findChildByName(node, name + "_wheelFR");
        this.wheelBL = this.findChildByName(node, name + "_wheelBL");
        this.wheelBR = this.findChildByName(node, name + "_wheelBR");
        console.log(this.wheelFL);
    }

    resetCarVariables() {
        this.velocity = new THREE.Vector3();
        this.accelerating = false;
        this.reversing = false;
    }

    findChildByName(group, childName) {
        for (let child of group.children) {
            if (child.name === childName)
                return child;
        }
        return null;
    }

    accelerate() {
        this.accelerating = true;
        this.reversing = false;
        console.log("Acceleration: " + this.acceleration);
    }

    reverse() {
        this.accelerating = false;
        this.reversing = true;
    }

    releaseAcceleration() {
        this.accelerating = false;
    }

    releaseReverse() {
        this.reversing = false;
    }

    turnLeft() {

        this.node.rotation.y -= 0.02;



    }

    turnRight() {



        this.node.rotation.y += 0.02;


    }

    updateSphere() {
        this.sphere.position.copy(this.node.position);
    }

    nextCamera() {
        if (this.currentVehicleCamera === 2) {
            this.currentVehicleCamera = 0;
        }
        else {
            this.currentVehicleCamera += 1;
        }
    }

    setRearView() {
        this.rearView = !this.rearView;
    }

    updateRearViewCamera() {
        if (this.currentVehicleCamera == 0) {
            this.app.activeCamera.position.set(this.node.position.x, this.node.position.y + 4 * this.height, this.node.position.z);
            var yRotation = -this.node.rotation.y;
            // Create a quaternion based on the Y rotation
            var quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yRotation, 0));
            // Create a vector representing the forward direction
            var forwardVector = new THREE.Vector3(0, 0, 1);
            // Apply the quaternion to the forward vector to get the direction
            forwardVector.applyQuaternion(quaternion);
            const lookAt = new THREE.Vector3(this.app.activeCamera.position.x - 2 * forwardVector.x, this.app.activeCamera.position.y + forwardVector.y, this.app.activeCamera.position.z + 2 * forwardVector.z)
            this.app.controls.target = lookAt;
        }
        else if (this.currentVehicleCamera == 1) {
            var yRotation = -this.node.rotation.y;
            // Create a quaternion based on the Y rotation
            var quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yRotation, 0));
            // Create a vector representing the forward direction
            var forwardVector = new THREE.Vector3(0, 0, 1);
            // Apply the quaternion to the forward vector to get the direction
            forwardVector.applyQuaternion(quaternion);
            this.app.activeCamera.position.set(this.node.position.x + 4 * forwardVector.x, this.node.position.y + 6 * this.height, this.node.position.z + 4 * forwardVector.z);
            const lookAt = new THREE.Vector3(this.app.activeCamera.position.x - 2 * forwardVector.x, this.app.activeCamera.position.y + forwardVector.y, this.app.activeCamera.position.z + 2 * forwardVector.z)
            this.app.controls.target = lookAt;
        }
    }
    updateFrontVehicleCamera() {
        if (this.currentVehicleCamera === 0) {
            this.freeCamera = false;
            this.app.activeCamera.position.set(this.node.position.x, this.node.position.y + 4 * this.height, this.node.position.z);
            var yRotation = -this.node.rotation.y;
            // Create a quaternion based on the Y rotation
            var quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yRotation, 0));
            // Create a vector representing the forward direction
            var forwardVector = new THREE.Vector3(0, 0, 1);
            // Apply the quaternion to the forward vector to get the direction
            forwardVector.applyQuaternion(quaternion);
            const lookAt = new THREE.Vector3(this.app.activeCamera.position.x + 2 * forwardVector.x, this.app.activeCamera.position.y + forwardVector.y, this.app.activeCamera.position.z - 2 * forwardVector.z)
            this.app.controls.target = lookAt;
        }
        else if (this.currentVehicleCamera === 1) {
            this.freeCamera = false;
            var yRotation = -this.node.rotation.y;
            // Create a quaternion based on the Y rotation
            var quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yRotation, 0));
            // Create a vector representing the forward direction
            var forwardVector = new THREE.Vector3(0, 0, 1);
            // Apply the quaternion to the forward vector to get the direction
            forwardVector.applyQuaternion(quaternion);
            this.app.activeCamera.position.set(this.node.position.x - 4 * forwardVector.x, this.node.position.y + 6 * this.height, this.node.position.z + 4 * forwardVector.z);
            const lookAt = new THREE.Vector3(this.app.activeCamera.position.x + 2 * forwardVector.x, this.app.activeCamera.position.y + forwardVector.y, this.app.activeCamera.position.z - 2 * forwardVector.z)
            this.app.controls.target = lookAt;
        }
        else if (this.currentVehicleCamera === 2) {
            if (!this.freeCamera) {
                this.freeCamera = true;
                this.app.activeCamera.position.set(this.node.position.x + 15, 15, this.node.position.z + 15);
                this.app.controls.target = this.node.position.clone();
            }
        }


    }

    updateVehicleCamera() {
        if (this.rearView) {
            this.updateRearViewCamera();
        }
        else {
            this.updateFrontVehicleCamera();
        }
    }

    update() {
        this.updateVehicleCamera();
        
        if (this.canMove) {
            if (this.accelerating) {
                // Accelerate in the direction of the car's orientation
                const accelerationVector = new THREE.Vector3(0, 0, -this.acceleration);
                accelerationVector.applyQuaternion(this.node.quaternion);
                this.velocity.add(accelerationVector);
            } else if (this.reversing) {
                // Reverse in the direction opposite to the car's orientation
                const reverseVector = new THREE.Vector3(0, 0, this.acceleration);
                reverseVector.applyQuaternion(this.node.quaternion);
                this.velocity.add(reverseVector);
            } else {
                // Deceleration when not accelerating or reversing
                this.velocity.multiplyScalar(1 - this.decelaration);
            }

            // Ensure the velocity does not exceed the maximum speed
            this.velocity.clampLength(-this.maxSpeed, this.maxSpeed);

            // Set the camera position to a certain offset from the car



            // Update the position based on the velocity
            this.node.position.add(this.velocity.clone().multiplyScalar(0.05));




            // Update the car's orientation
            this.node.rotation.x = 0;
            this.node.rotation.z = 0;

            // Update the position of the surrounding sphere
            this.updateSphere();
        }

    }
}

export { MyVehicle };