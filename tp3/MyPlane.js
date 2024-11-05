import * as THREE from 'three';

/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */

class MyPlane {

	constructor(app, width = 1, height = 1, nrDivs = 10) {
		this.app = app
		this.geometry = new THREE.PlaneGeometry(width, height, nrDivs, nrDivs );
		this.material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide } ); 
		this.mesh = new THREE.Mesh( this.geometry, this.material )
		this.mesh.rotateX(-Math.PI/2)
		this.setFillMode()
	}

	setFillMode() { 
		this.material.wireframe = false;
		this.material.needsUpdate = true;
	}

	setLineMode() { 
		this.material.wireframe = true;
		this.material.needsUpdate = true;
	}

	setWireframe(value) {
		if (value) {
			this.setLineMode()
		} else {
			this.setFillMode()
		}
	}

}

export {MyPlane}

