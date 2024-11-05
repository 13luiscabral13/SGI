import * as THREE from 'three';
import { MyQuad } from './MyQuad.js';


export class MyBillboard {
  constructor(app, quadTexture) {
    this.app = app;
    this.quad = new MyQuad(this.app);
    this.quadTexture = quadTexture;
    this.billboard = null;
  }

  display(x, y, z) {
    this.billboard = new THREE.Object3D();
    this.billboard.position.set(x, y, z);
    this.billboard.scale.set(4, -8, 4);

    // Obtain the camera position
    if (this.quadTexture !== null) {
      this.quadTexture.wrapS = this.quadTexture.wrapT = THREE.RepeatWrapping;
      this.quadTexture.repeat.set(1, 1);

      const material = new THREE.MeshBasicMaterial({ map: this.quadTexture });
    material.transparent = true;
      const quadMesh = new THREE.Mesh(this.quad.geometry, material);
      this.billboard.add(quadMesh);
    }
    this.app.scene.add(this.billboard);
}

  update() {
    const cameraPosition = this.app.activeCamera.position;
    // Position the billboard at the same position as the camera
    
    // Make it lookAt the camera
    this.billboard.lookAt(cameraPosition);
  }
}

