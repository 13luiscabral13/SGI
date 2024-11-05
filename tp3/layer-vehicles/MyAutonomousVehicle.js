import * as THREE from 'three';

class MyAutonomousVehicle {
    /**
       constructs the object
       @param {MyContents} scene The scene object
    */
    constructor(app, vehicle) {
        this.app = app;
        this.node = vehicle.node;
        this.vehicleObject = vehicle;
        this.keyPoints = [

            // FYI: When viewing the track from above (with it looking like a pistol), Z is positive to the left and X is positive to the bottom

            // Straight 1
            
            new THREE.Vector3(0, 0.8, 1.5),
            new THREE.Vector3(4.5, 0.8, 1.5),
            new THREE.Vector3(9.5, 0.8, 1.5),
            new THREE.Vector3(14.5, 0.8, 1.5),
            new THREE.Vector3(19.5, 0.8, 1.5),
            new THREE.Vector3(24.5, 0.8, 1.5),
            new THREE.Vector3(29.5, 0.8, 1.5),
            new THREE.Vector3(34.5, 0.8, 1.5),
            new THREE.Vector3(37.5, 0.8, 0.5),
            
            // Turn 1
            
            new THREE.Vector3(40.5, 0.8, -2.5),
            new THREE.Vector3(41.5, 0.8, -5.5),
            new THREE.Vector3(41.5, 0.8, -8.5),
            new THREE.Vector3(41.5, 0.8, -11.5),
            new THREE.Vector3(40.75, 0.8, -14.5),
            new THREE.Vector3(39, 0.8, -18.5),
            
            // Straight 2
            
            new THREE.Vector3(34.5, 0.8, -20.5),
            new THREE.Vector3(29.5, 0.8, -20.5),
            new THREE.Vector3(24.5, 0.8, -20.5),
            new THREE.Vector3(19.5, 0.8, -20.5),
            new THREE.Vector3(14.5, 0.8, -20.5),
            new THREE.Vector3(9.5, 0.8, -20.5),
            new THREE.Vector3(4.5, 0.8, -20.5),
            new THREE.Vector3(0, 0.8, -20.5),
            new THREE.Vector3(-5.5, 0.8, -20.5),
            new THREE.Vector3(-9.5, 0.8, -20.5),
            new THREE.Vector3(-12.5, 0.8, -21),
            
            // Turn 2

            new THREE.Vector3(-14.5, 0.8, -23.5),
            new THREE.Vector3(-15.5, 0.8, -26.5),
            new THREE.Vector3(-15.5, 0.8, -29.5),
            new THREE.Vector3(-14.5, 0.8, -32.5),
            new THREE.Vector3(-11.5, 0.8, -34.5),
            
            // Straight 3
            new THREE.Vector3(-7.5, 0.8, -34),
            new THREE.Vector3(-3.5, 0.8, -33.5),
            new THREE.Vector3(1.5, 0.8, -33),
            new THREE.Vector3(5.5, 0.8, -33),
            new THREE.Vector3(9.5, 0.8, -33),
            
            // Turn 3

            new THREE.Vector3(13.5, 0.8, -35.5),
            new THREE.Vector3(14.5, 0.8, -39.5),
            new THREE.Vector3(15, 0.8, -43.5),
            new THREE.Vector3(14.5, 0.8, -47.5),
            new THREE.Vector3(11.5, 0.8, -49.5),
            
            // Chicane

            new THREE.Vector3(8.5, 0.8, -49.5),
            new THREE.Vector3(4.5, 0.8, -49.5),
            new THREE.Vector3(2, 0.8, -50.5),
            new THREE.Vector3(0.5, 0.8, -54.5),
            new THREE.Vector3(0.5, 0.8, -58.5),
            new THREE.Vector3(0.5, 0.8, -62.5),
            new THREE.Vector3(0, 0.8, -67.5),

            // Straight 4
            
            new THREE.Vector3(-4.5, 0.8, -72.5),
            new THREE.Vector3(-9.5, 0.8, -74.5),
            new THREE.Vector3(-14.5, 0.8, -75.5),
            new THREE.Vector3(-19.5, 0.8, -76.5),

            // Straight 5

            new THREE.Vector3(-23.5, 0.8, -76.5),
            new THREE.Vector3(-27.5, 0.8, -75.5),
            new THREE.Vector3(-31.5, 0.8, -74.5),
            new THREE.Vector3(-35.5, 0.8, -73.5),
            new THREE.Vector3(-39.5, 0.8, -72),
            new THREE.Vector3(-43.5, 0.8, -67),

            // Straight 6

            new THREE.Vector3(-45.5, 0.8, -62),
            new THREE.Vector3(-47, 0.8, -55),
            new THREE.Vector3(-48.5, 0.8, -47.5),
            new THREE.Vector3(-48.5, 0.8, -40.5),
            new THREE.Vector3(-48.5, 0.8, -33.5),
            new THREE.Vector3(-48.5, 0.8, -26.5),
            new THREE.Vector3(-48.5, 0.8, -19.5),
            new THREE.Vector3(-47, 0.8, -12.5),

            // Straight 7

            new THREE.Vector3(-43.5, 0.8, -3.5),
            new THREE.Vector3(-39.5, 0.8, 1.5),
            new THREE.Vector3(-33.5, 0.8, 1.5),
            new THREE.Vector3(-27.5, 0.8, 1.5),
            new THREE.Vector3(-21.5, 0.8, 1.5),
            new THREE.Vector3(-16.5, 0.8, 1.5),
            new THREE.Vector3(-10.5, 0.8, 1.5),
            new THREE.Vector3(-4.5, 0.8, 1.5),
            new THREE.Vector3(0, 0.8, 1.5),
        ];

        this.clock = new THREE.Clock()

        this.mixerTime = 0;
        this.mixerPause = false;

        this.animationMaxDuration = 74 //seconds

        this.setupKeyFrames();

        this.startAnimation();
    }

    startAnimation() {
        const positionKF = new THREE.VectorKeyframeTrack('.position', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74],
            [
                ...this.keyPoints[0],
                ...this.keyPoints[1],
                ...this.keyPoints[2],
                ...this.keyPoints[3],
                ...this.keyPoints[4],
                ...this.keyPoints[5],
                ...this.keyPoints[6],
                ...this.keyPoints[7],
                ...this.keyPoints[8],
                ...this.keyPoints[9],
                ...this.keyPoints[10],
                ...this.keyPoints[11],
                ...this.keyPoints[12],
                ...this.keyPoints[13],
                ...this.keyPoints[14],
                ...this.keyPoints[15],
                ...this.keyPoints[16],
                ...this.keyPoints[17],
                ...this.keyPoints[18],
                ...this.keyPoints[19],
                ...this.keyPoints[20],
                ...this.keyPoints[21],
                ...this.keyPoints[22],
                ...this.keyPoints[23],
                ...this.keyPoints[24],
                ...this.keyPoints[25],
                ...this.keyPoints[26],
                ...this.keyPoints[27],
                ...this.keyPoints[28],
                ...this.keyPoints[29],
                ...this.keyPoints[30],
                ...this.keyPoints[31],
                ...this.keyPoints[32],
                ...this.keyPoints[33],
                ...this.keyPoints[34],
                ...this.keyPoints[35],
                ...this.keyPoints[36],
                ...this.keyPoints[37],
                ...this.keyPoints[38],
                ...this.keyPoints[39],
                ...this.keyPoints[40],
                ...this.keyPoints[41],
                ...this.keyPoints[42],
                ...this.keyPoints[43],
                ...this.keyPoints[44],
                ...this.keyPoints[45],
                ...this.keyPoints[46],
                ...this.keyPoints[47],
                ...this.keyPoints[48],
                ...this.keyPoints[49],
                ...this.keyPoints[50],
                ...this.keyPoints[51],
                ...this.keyPoints[52],
                ...this.keyPoints[53],
                ...this.keyPoints[54],
                ...this.keyPoints[55],
                ...this.keyPoints[56],
                ...this.keyPoints[57],
                ...this.keyPoints[58],
                ...this.keyPoints[59],
                ...this.keyPoints[60],
                ...this.keyPoints[61],
                ...this.keyPoints[62],
                ...this.keyPoints[63],
                ...this.keyPoints[64],
                ...this.keyPoints[65],
                ...this.keyPoints[66],
                ...this.keyPoints[67],
                ...this.keyPoints[68],
                ...this.keyPoints[69],
                ...this.keyPoints[70],
                ...this.keyPoints[71],
                ...this.keyPoints[72],
                ...this.keyPoints[73],
                ...this.keyPoints[74],
            ],
            THREE.InterpolateSmooth  /* THREE.InterpolateLinear (default), THREE.InterpolateDiscrete,*/
        )

        const yAxis = new THREE.Vector3(0, 1, 0)

        // Straight 1
        const q1 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q2 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q3 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q4 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q5 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q6 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q7 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.75);
        const q8 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.9);
        const q9 = new THREE.Quaternion().setFromAxisAngle(yAxis, 5.2);


        // Turn 1
        const q10 = new THREE.Quaternion().setFromAxisAngle(yAxis, 5.7);
        const q11 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.1);
        const q12 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.2);
        const q13 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.4);
        const q14 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.6);
        const q15 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.1);


        // Straight 2
        const q16 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.4);
        const q17 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q18 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q19 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q20 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q21 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q22 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q23 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q24 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q25 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q26 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.4);


        // Turn 2
        const q27 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.4);
        const q28 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.4);
        const q29 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.2);
        const q30 = new THREE.Quaternion().setFromAxisAngle(yAxis, 5.8);
        const q31 = new THREE.Quaternion().setFromAxisAngle(yAxis, 5);


        // Straight 3
        const q32 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.8);
        const q33 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.6);
        const q34 = new THREE.Quaternion().setFromAxisAngle(yAxis, 4.8);
        const q35 = new THREE.Quaternion().setFromAxisAngle(yAxis, 5);
        const q36 = new THREE.Quaternion().setFromAxisAngle(yAxis, 5.2);

        
        // Turn 3
        const q37 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.2);
        const q38 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.2);
        const q39 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.4);
        const q40 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.8);
        const q41 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.4);


        // Chicane
        const q42 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.6);
        const q43 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.4);
        const q44 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.2);
        const q45 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.6);
        const q46 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.5);
        const q47 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.4);
        const q48 = new THREE.Quaternion().setFromAxisAngle(yAxis, 6.4);


        // Straight 4
        const q49 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.2);
        const q50 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.4);
        const q51 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.6);
        const q52 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);


        // Straight 5
        const q53 = new THREE.Quaternion().setFromAxisAngle(yAxis, 7.8);
        const q54 = new THREE.Quaternion().setFromAxisAngle(yAxis, 8);
        const q55 = new THREE.Quaternion().setFromAxisAngle(yAxis, 8.2);
        const q56 = new THREE.Quaternion().setFromAxisAngle(yAxis, 8.4);
        const q57 = new THREE.Quaternion().setFromAxisAngle(yAxis, 8.6);
        const q58 = new THREE.Quaternion().setFromAxisAngle(yAxis, 8.8);


        // Straight 6
        const q59 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9);
        const q60 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.2);
        const q61 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.4);
        const q62 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.4);
        const q63 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.4);
        const q64 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.4);
        const q65 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.6);
        const q66 = new THREE.Quaternion().setFromAxisAngle(yAxis, 9.8);

        
        // Straight 7
        const q67 = new THREE.Quaternion().setFromAxisAngle(yAxis, 10.2);
        const q68 = new THREE.Quaternion().setFromAxisAngle(yAxis, 10.8);
        const q69 = new THREE.Quaternion().setFromAxisAngle(yAxis, 11);
        const q70 = new THREE.Quaternion().setFromAxisAngle(yAxis, 11);
        const q71 = new THREE.Quaternion().setFromAxisAngle(yAxis, 11);
        const q72 = new THREE.Quaternion().setFromAxisAngle(yAxis, 11);
        const q73 = new THREE.Quaternion().setFromAxisAngle(yAxis, 11);
        


        const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
            [   q1.x, q1.y, q1.z, q1.w,
                q2.x, q2.y, q2.z, q2.w,
                q3.x, q3.y, q3.z, q3.w,
                q4.x, q4.y, q4.z, q4.w,
                q5.x, q5.y, q5.z, q5.w,
                q6.x, q6.y, q6.z, q6.w,
                q7.x, q7.y, q7.z, q7.w,
                q8.x, q8.y, q8.z, q8.w,
                q9.x, q9.y, q9.z, q9.w,
                q10.x, q10.y, q10.z, q10.w,
                q11.x, q11.y, q11.z, q11.w,
                q12.x, q12.y, q12.z, q12.w,
                q13.x, q13.y, q13.z, q13.w,
                q14.x, q14.y, q14.z, q14.w,
                q15.x, q15.y, q15.z, q15.w,
                q16.x, q16.y, q16.z, q16.w,
                q17.x, q17.y, q17.z, q17.w,
                q18.x, q18.y, q18.z, q18.w,
                q19.x, q19.y, q19.z, q19.w,
                q20.x, q20.y, q20.z, q20.w,
                q21.x, q21.y, q21.z, q21.w,
                q22.x, q22.y, q22.z, q22.w,
                q23.x, q23.y, q23.z, q23.w,
                q24.x, q24.y, q24.z, q24.w,
                q25.x, q25.y, q25.z, q25.w,
                q26.x, q26.y, q26.z, q26.w,
                q27.x, q27.y, q27.z, q27.w,
                q28.x, q28.y, q28.z, q28.w,
                q29.x, q29.y, q29.z, q29.w,
                q30.x, q30.y, q30.z, q30.w,
                q31.x, q31.y, q31.z, q31.w,
                q32.x, q32.y, q32.z, q32.w,
                q33.x, q33.y, q33.z, q33.w,
                q34.x, q34.y, q34.z, q34.w,
                q35.x, q35.y, q35.z, q35.w,
                q36.x, q36.y, q36.z, q36.w,
                q37.x, q37.y, q37.z, q37.w,
                q38.x, q38.y, q38.z, q38.w,
                q39.x, q39.y, q39.z, q39.w,
                q40.x, q40.y, q40.z, q40.w,
                q41.x, q41.y, q41.z, q41.w,
                q42.x, q42.y, q42.z, q42.w,
                q43.x, q43.y, q43.z, q43.w,
                q44.x, q44.y, q44.z, q44.w,
                q45.x, q45.y, q45.z, q45.w,
                q46.x, q46.y, q46.z, q46.w,
                q47.x, q47.y, q47.z, q47.w,
                q48.x, q48.y, q48.z, q48.w,
                q49.x, q49.y, q49.z, q49.w,
                q50.x, q50.y, q50.z, q50.w,
                q51.x, q51.y, q51.z, q51.w,
                q52.x, q52.y, q52.z, q52.w,
                q53.x, q53.y, q53.z, q53.w,
                q54.x, q54.y, q54.z, q54.w,
                q55.x, q55.y, q55.z, q55.w,
                q56.x, q56.y, q56.z, q56.w,
                q57.x, q57.y, q57.z, q57.w,
                q58.x, q58.y, q58.z, q58.w,
                q59.x, q59.y, q59.z, q59.w,
                q60.x, q60.y, q60.z, q60.w,
                q61.x, q61.y, q61.z, q61.w,
                q62.x, q62.y, q62.z, q62.w,
                q63.x, q63.y, q63.z, q63.w,
                q64.x, q64.y, q64.z, q64.w,
                q65.x, q65.y, q65.z, q65.w,
                q66.x, q66.y, q66.z, q66.w,
                q67.x, q67.y, q67.z, q67.w,
                q68.x, q68.y, q68.z, q68.w,
                q69.x, q69.y, q69.z, q69.w,
                q70.x, q70.y, q70.z, q70.w,
                q71.x, q71.y, q71.z, q71.w,
                q72.x, q72.y, q72.z, q72.w,
                q73.x, q73.y, q73.z, q73.w,
            ]
        );

        const positionClip = new THREE.AnimationClip('positionAnimation', this.animationMaxDuration, [positionKF])
        const rotationClip = new THREE.AnimationClip('rotationAnimation', this.animationMaxDuration, [quaternionKF])

        // Create an AnimationMixer
        this.mixer = new THREE.AnimationMixer(this.node)

        // Create AnimationActions for each clip
        const positionAction = this.mixer.clipAction(positionClip)
        const rotationAction = this.mixer.clipAction(rotationClip)

        // Play both animations
        positionAction.play()
        rotationAction.play()
    }

    /**
     * Build control points and a visual path for debug
     */
    setupKeyFrames() {
        // Generate points using a catmull spline

        this.spline = new THREE.CatmullRomCurve3([...this.keyPoints]);

        // Setup visual control points

        for (let i = 0; i < this.keyPoints.length; i++) {
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.scale.set(0.2, 0.2, 0.2)
            sphere.position.set(... this.keyPoints[i])

            //this.app.scene.add(sphere)
        }

        const tubeGeometry = new THREE.TubeGeometry(this.spline, 100, 0.05, 10, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        //this.app.scene.add(tubeMesh)
    }

    /**
     * Start/Stop all animations
     */
    checkAnimationStateIsPause() {
        if (this.mixerPause)
            this.mixer.timeScale = 0
        else
            this.mixer.timeScale = 0.74*this.vehicleObject.maxSpeed;
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        const delta = this.clock.getDelta()
        this.mixer.update(delta)
        this.vehicleObject.updateSphere();
        this.checkAnimationStateIsPause();

        this.vehicleObject.updateSphere();
    }
}

export { MyAutonomousVehicle };