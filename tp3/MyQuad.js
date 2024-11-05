import * as THREE from 'three';

export class MyQuad {
  constructor(coords) {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.initBuffers();

    if (coords !== undefined) {
      this.updateTexCoords(coords);
    }
  }

  initBuffers() {
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([
        -0.5, -0.5, 0,  // 0
        0.5, -0.5, 0,   // 1
        -0.5, 0.5, 0,   // 2
        0.5, 0.5, 0     // 3
      ]), 3)
    );

    this.geometry.setIndex([
      0, 1, 2,
      1, 3, 2,
      2, 1, 0,
      2, 3, 1
    ]);

    this.geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ]), 3)
    );

    this.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        1, 0
      ]), 2)
    );

    this.geometry.computeVertexNormals();
  }

  updateTexCoords(coords) {
    this.geometry.attributes.uv.array.set(coords);
    this.geometry.attributes.uv.needsUpdate = true;
  }

}
