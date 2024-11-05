import * as THREE from 'three'

class MyFirework {

    constructor(app, scene) {
        this.app = app
        this.scene = scene

        this.done     = false 
        this.dest     = [] 
        
        this.vertices = []
        this.colors   = []
        this.geometry = null
        this.points   = null
        
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthTest: false,
        })
        
        this.height = 17
        this.speed = 26

        this.explosionMaterial = new THREE.PointsMaterial({
            size: 0.1,  // Tamanho das partículas da explosão
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthTest: false,
        });     

        this.launch() 

    }

    /**
     * compute particle launch
     */

    launch() {
        // Cor da partícula
        let color = new THREE.Color()
        color.setHSL( THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.4 )
        this.colors.push(color.r, color.g, color.b)

        // Calculate highest point position
        let x = THREE.MathUtils.randFloat( -8, 4 ) 
        let y = THREE.MathUtils.randFloat( this.height * 0.9, this.height * 1.1)
        let z = THREE.MathUtils.randFloat( -48, -28 ) 

        // Calculate launch position
        this.x0 = THREE.MathUtils.randFloat( -4, 0 )
        this.z0 = THREE.MathUtils.randFloat( -42, -34 )
        this.vertices.push(this.x0,0,this.z0)

        // Calculate launch angles
        this.horizontalLaunchAngle = Math.atan2((z - this.z0), (x - this.x0));
        this.verticalLaunchAngle = Math.atan2(y, Math.sqrt((x - this.x0)**2 + (z - this.z0)**2));

        this.Vx = this.speed * Math.cos(this.horizontalLaunchAngle) * Math.cos(this.verticalLaunchAngle);
        this.Vz = this.speed * Math.sin(this.horizontalLaunchAngle) * Math.cos(this.verticalLaunchAngle);
        this.Vy = this.speed * Math.sin(this.verticalLaunchAngle);

        this.dest.push( x, y, z ) 

        
        // Geometria da partícula
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(this.vertices), 3 ) );
        this.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(this.colors), 3 ) );
        this.points = new THREE.Points( this.geometry, this.material )
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.app.scene.add( this.points )  

        this.startTime = Date.now();
    }

    /**
     * compute explosion
     * @param {*} vector 
     */
    explode(origin, n, rangeBegin, rangeEnd) {
        if(this.geometry) {
            this.dest     = [] 
            this.vertices = []
            this.colors   = [] 
            this.points   = []
            this.app.scene.remove(this.points);
            this.geometry.dispose();
        }

        for (let i = 0; i < n; i++) {
            const theta = Math.random() * Math.PI * 2;  // Ângulo aleatório
            const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));  // Ângulo polar aleatório

            const radius = THREE.MathUtils.randFloat(rangeBegin, rangeEnd);  // Raio aleatório dentro do intervalo especificado
            const x = origin[0] + radius * Math.sin(phi) * Math.cos(theta);
            const y = origin[1] + radius * Math.sin(phi) * Math.sin(theta);
            const z = origin[2] + radius * Math.cos(phi);

            this.dest.push(x, y, z);
            this.vertices.push(origin[0], origin[1], origin[2]);

            // Defina cores aleatórias para as partículas da explosão
            const color = new THREE.Color();
            color.setHSL(THREE.MathUtils.randFloat(0.1, 0.9), 1, 0.4);
            this.colors.push(color.r, color.g, color.b);
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));

        // Crie os pontos da explosão
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.app.scene.add(this.points);
    }
    
    /**
     * cleanup
     */
    reset() {
        console.log("firework reseted")
        this.app.scene.remove( this.points )  
        this.dest     = [] 
        this.vertices = []
        this.colors   = [] 
        this.geometry = null
        this.points   = null
    }

    /**
     * update firework
     * @returns 
     */
    update() {
        
        // do only if objects exist
        if( this.points && this.geometry )
        {
            let verticesAtribute = this.geometry.getAttribute( 'position' )
            let vertices = verticesAtribute.array
            let count = verticesAtribute.count

            if( count === 1) {
                // Calculate time elapsed since launch
                let elapsedSeconds = (Date.now() - this.startTime) / 1000;
    
                // Calculate new positions using ballistic trajectory equations
                vertices[0] = this.Vx * elapsedSeconds + this.x0;
                vertices[1] = this.Vy * elapsedSeconds - 0.5 * 9.8 * elapsedSeconds ** 2;
                vertices[2] = this.Vz * elapsedSeconds + this.z0;  
            }

            if( count > 1) {
                for( let i = 0; i < vertices.length; i+=3 ) {
                    vertices[i  ] += ( this.dest[i  ] - vertices[i  ] ) / this.speed
                    vertices[i+1] += ( this.dest[i+1] - vertices[i+1] ) / this.speed
                    vertices[i+2] += ( this.dest[i+2] - vertices[i+2] ) / this.speed
                }
            }
            
            verticesAtribute.needsUpdate = true
            
            // only one particle?
            if( count === 1 ) {
                //is YY coordinate higher close to destination YY? 
                if( Math.ceil( vertices[1] ) > ( this.dest[1] ) ) {
                    // add n particles departing from the location at (vertices[0], vertices[1], vertices[2])
                    this.explode(vertices, 80, this.height * 0.05, this.height * 0.8) 
                    return 
                }
            }
            
            // are there a lot of particles (aka already exploded)?
            if( count > 1 ) {
                // fade out exploded particles 
                this.material.opacity -= 0.015 
                this.material.needsUpdate = true
            }
            
            // remove, reset and stop animating 
            if( this.material.opacity <= 0 )
            {
                this.reset() 
                this.done = true 
                return 
            }
        }
    }
}

export { MyFirework }