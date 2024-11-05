import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyReader } from './MyReader.js';
import { MyFirework } from './MyFirework.js';
import { MyShader } from './MyShader.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = null

        this.myReader = new MyReader(app);

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 100
        this.lastUpdate = [];
        this.maxPossibleSpeed = 0;
        this.mirrored = false;
        this.shield = false;
        this.clock = new THREE.Clock();
        this.clock.start();
        this.mainSong = new Audio();
        this.soundEffect = new Audio();
        this.canvas = document.getElementById("canvas");
        this.img = document.createElement("img");

        // AVAILABLE LAYERS
        // Layer 1 = none
        // Layer 3 = obstáculos
        // Layer 4 = posições
        // Layer 5 = botões do outdoor display e veículos
        this.raycaster.layers.set(5);

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.selectedObstacle = null;
        this.selectedButton = null;
        this.pickingColor = "0x00ff00"

        // Campos de input do menu inicial
        this.player1Vehicle = null;
        this.player2Vehicle = null;
        this.selectedLevel = 'beginner';
        this.selectedLaps = 'laps3';

        this.levels = ['beginner', 'intermediate', 'expert'];
        this.laps = ['laps3', 'laps4', 'laps5'];


        this.initKeys();
        this.initGameState();

        document.addEventListener(
            //"pointermove",
            // "mousemove",
            "pointerdown",
            this.onPointerDown.bind(this)
        );
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        this.pointLight = new THREE.PointLight(0xffffff, 40, 0);
        this.pointLight.position.set(0, 10, 0);

        this.pointLight.castShadow = true;
        this.pointLight.shadow.mapSize.width = this.mapSize;
        this.pointLight.shadow.mapSize.height = this.mapSize;
        this.pointLight.shadow.camera.near = 0.5;
        this.pointLight.shadow.camera.far = 500;
        this.app.scene.add(this.pointLight);


        // add an ambient light
        this.ambientLight = new THREE.AmbientLight(0x555555, 20);
        this.app.scene.add(this.ambientLight);
    }

    initKeys() {
        // Estados das teclas

        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false,
            c: false,
            b: false,
        };

        // Lidar com eventos de tecla pressionada
        document.addEventListener('keydown', (event) => {
            if (this.selectedButton !== null && this.selectedButton.name === 'name') {
                this.handleUserInput(event);
            }

            if (this.keys.hasOwnProperty(event.key)) {
                this.keys[event.key] = true;
            }
        });

        // Lidar com eventos de tecla solta
        document.addEventListener('keyup', (event) => {
            if (this.keys.hasOwnProperty(event.key)) {
                this.keys[event.key] = false;
                if (this.myReader.manualCar.canMove) {
                    // Lógica de aceleração/desaceleração/virar com base na tecla pressionada
                    if (event.key === 'ArrowUp' || event.key === 'w') {
                        if (!this.mirrored) {
                            this.myReader.manualCar.releaseAcceleration();
                        }
                        else {
                            this.myReader.manualCar.releaseReverse();
                        }
                    } else if (event.key === 'ArrowDown' || event.key === 's') {
                        if (!this.mirrored) {
                            this.myReader.manualCar.releaseReverse();
                        }
                        else {
                            this.myReader.manualCar.releaseAcceleration();
                        }
                    }
                }
                if (event.key === 'c') {
                    this.myReader.manualCar.nextCamera();
                }
                else if (event.key === 'b') {
                    if (!this.myReader.manualCar.freeCamera) {
                        this.myReader.manualCar.setRearView();
                    }
                }
            }
        });
    }

    handleUserInput(event) {
        const key = event.key;

        // Verificar se a tecla pressionada é alfanumérica
        const isAlphanumeric = /^[a-zA-Z0-9]$/.test(key);

        if (isAlphanumeric) {
            // Desenhar a letra
            const letra = key.toUpperCase();
            this.myReader.drawLetter(letra);
        } else if (key === 'Backspace') {
            // Apagar o último caracter
            this.myReader.eraseLetter();
        }
    }

    processKeys() {
        if (this.keys.ArrowUp || this.keys.w) {
            if (!this.mirrored) {
                this.myReader.manualCar.accelerate();
            }
            else {
                this.myReader.manualCar.reverse();
            }
            //console.log("Arrow up or W pressed");            
        }
        if (this.keys.ArrowDown || this.keys.s) {
            if (!this.mirrored) {
                this.myReader.manualCar.reverse();
            }
            else {
                this.myReader.manualCar.accelerate();
            }
            //console.log("Arrow down or S pressed");
        }
        if (this.keys.ArrowLeft || this.keys.a) {
            if (!this.mirrored) {
                this.myReader.manualCar.turnRight();
            }
            else {
                this.myReader.manualCar.turnLeft();
            }
            //console.log("Arrow left or a pressed");
        }
        if (this.keys.ArrowRight || this.keys.d) {
            //console.log("Arrow right or d pressed");
            if (!this.mirrored) {
                this.myReader.manualCar.turnLeft();
            }
            else {
                this.myReader.manualCar.turnRight();
            }
        }

    }

    initGameState() {
        this.states = {
            Start: 'START',
            Playing: 'PLAYING',
            Pause: 'PAUSE',
            GameOver: 'GAME_OVER',
            Waiting: 'WAITING',
            ObstacleCollision: 'OBSTACLE_COLLISION',
            CarCollision: 'CAR_COLLISION',
            PowerUpCollision: 'POWER_UP_COLLISION',
            SelectingObstcale: 'SELECTING_OBSTACLE',
            SelectingPosition: 'SELECTING_POSITION',
        }

        this.gameState = this.states.Start;
        this.myReader.setGameVariables();
        this.mainSong.src = "assets/sounds/main_song.mp3";
        this.mainSong.play();
        this.mainSong.loop = true; 
    }

    gameoverState() {    
        if(!this.myReader.visibleLayers.includes("outdoordisplay")) {
            console.log("STATE GAMEOVER");
            if(this.myReader.manualCarFinishTime <= this.myReader.autonomousCarFinishTime) {
                console.log("Manual car won");
                console.log("Time: ", this.myReader.manualCarFinishTime);
            } else {
                console.log("Autonomous car won");
                console.log("Time: ", this.myReader.autonomousCarFinishTime);
            }

            this.raycaster.layers.set(5);
            this.myReader.obstaclesReader.removeObstaclesFromScene();
            this.myReader.gameoverOutdoorDisplay();
            this.myReader.setVisibleLayers(["outdoordisplay", "vehicles"]);
        }  
        
        // CARRO MANUAL GANHOU
        if(this.myReader.manualCarFinishTime <= this.myReader.autonomousCarFinishTime) {
            this.winningState();
        }

        if(this.intersectedObj!==null && this.intersectedObj.name === "play_again") {
            console.log("Botão de play again selecionado");

            // DAR RESET APENAS DE ALGUMAS VARIÁVEIS
            this.myReader.setGameVariables(true);

            // MUDAR PARA O ESTADO DE PLAYING SEM PASSAR PELO MENU INICIAL OUTRA VEZ
            this.gameState = this.states.Playing;
            this.raycaster.layers.set(1);
            this.intersectedObj = null;
        }

        if(this.intersectedObj!==null && this.intersectedObj.name === "menu") {
            console.log("Botão de menu selecionado");

            // DAR RESET DE TODAS AS VARIÁVEIS
            this.myReader.setGameVariables();

            // VOLTAR AO ESTADO DO MENU INICIAL
            this.gameState = this.states.Start;
            this.intersectedObj = null;
            this.player1Vehicle = null;
            this.player2Vehicle = null;
        }
    }

    winningState() {
        // add new fireworks every 5% of the calls
        if(Math.random()  < 0.05 ) {
            this.myReader.fireworks.push(new MyFirework(this.app, this))
            //console.log("firework added")
        }

        // for each fireworks 
        for( let i = 0; i < this.myReader.fireworks.length; i++ ) {
            // is firework finished?
            if (this.myReader.fireworks[i].done) {
                // remove firework 
                this.myReader.fireworks.splice(i,1) 
                //console.log("firework removed")
                continue 
            }
            // otherwise upsdate  firework
            this.myReader.fireworks[i].update()
        }
    }

    waitingState() {
        this.myReader.atualizarTempoDecorrido();
        this.updateLaps();

        if(this.myReader.autonomousCar) {
            this.myReader.autonomousCar.update();
        }
    }

    startState() {
        if(this.intersectedObj!== null && (this.intersectedObj.name==='name' || this.intersectedObj.name==='player1' || this.intersectedObj.name==='player2' || this.intersectedObj.name==='start' || this.intersectedObj.name==='level' || this.intersectedObj.name==='laps')) {
            this.selectedButton = this.intersectedObj;
            this.intersectedObj = null;
        }

        if (this.selectedButton === null) {
            return;
        }

        if ((this.selectedButton.name !== 'player1' && this.myReader.visibleLayers.includes("player1Park")) || (this.selectedButton.name !== 'player2' && this.myReader.visibleLayers.includes("player2Park"))) {
            this.myReader.setVisibleLayers([]);
            this.myReader.exitPark();
        }

        if (this.selectedButton.name === 'player1') {
            // Mudar a cena para o parque de estacionamento caso ainda não o tenha feito
            if(!this.myReader.visibleLayers.includes("player1Park")) {
                this.myReader.setVisibleLayers(['player1Park']);
                this.myReader.drawPark();

                if (this.player1Vehicle) {
                    this.myReader.addPlatform(this.player1Vehicle);
                }
            }

            // Quando o carro for selecionado
            if (this.intersectedObj !== null) {
                // Retirar plataforma do carro anteriormente selecionado
                if (this.player1Vehicle) {
                    this.myReader.removePlatform(this.player1Vehicle)
                }

                // Adicionar plataforma ao novo carro selecionado
                this.myReader.addPlatform(this.intersectedObj);

                this.player1Vehicle = this.intersectedObj;
                this.myReader.drawPlayer1VehicleName(this.player1Vehicle.name);

                // Reset das variáveis de interseção do raycaster
                this.intersectedObj = null;
            }
        }

        if (this.selectedButton.name === 'player2') {
            // Mudar a cena para o parque de estacionamento caso ainda não o tenha feito
            if(!this.myReader.visibleLayers.includes("player2Park")) {
                this.myReader.setVisibleLayers(['player2Park']);
                this.myReader.drawPark();

                if (this.player2Vehicle) {
                    this.myReader.addPlatform(this.player2Vehicle);
                }
            }

            // Quando o carro for selecionado
            if (this.intersectedObj !== null) {
                // Retirar plataforma do carro anteriormente selecionado
                if (this.player2Vehicle) {
                    this.myReader.removePlatform(this.player2Vehicle)
                }

                // Adicionar plataforma ao novo carro selecionado
                this.myReader.addPlatform(this.intersectedObj);

                this.player2Vehicle = this.intersectedObj;
                this.myReader.drawPlayer2VehicleName(this.player2Vehicle.name);

                // Reset das variáveis de interseção do raycaster
                this.intersectedObj = null;
            }
        }

        if(this.selectedButton.name === 'level') {
            const prevlevelText = this.selectedButton.children.find(child => child.name === this.selectedLevel);
            prevlevelText.visible = false;

            // Mudar para o próximo nível
            const currentIndex = this.levels.indexOf(this.selectedLevel);

            // Se o índice não for encontrado ou for o último elemento, retorna o primeiro elemento
            if (currentIndex === -1 || currentIndex === this.levels.length - 1) {
                this.selectedLevel = this.levels[0];
            } else {
                // Retorna o próximo elemento na lista
                this.selectedLevel = this.levels[currentIndex + 1];
            }

            const newlevelText = this.selectedButton.children.find(child => child.name === this.selectedLevel);
            newlevelText.visible = true;

            this.selectedButton = null;
            return;
        }

        if(this.selectedButton.name === 'laps') {
            const prevlapsText = this.selectedButton.children.find(child => child.name === this.selectedLaps);
            prevlapsText.visible = false;

            // Mudar para o próximo nº de laps
            const currentIndex = this.laps.indexOf(this.selectedLaps);

            // Se o índice não for encontrado ou for o último elemento, retorna o primeiro elemento
            if (currentIndex === -1 || currentIndex === this.laps.length - 1) {
                this.selectedLaps = this.laps[0];
            } else {
                // Retorna o próximo elemento na lista
                this.selectedLaps = this.laps[currentIndex + 1];
            }

            const newlapsText = this.selectedButton.children.find(child => child.name === this.selectedLaps);
            newlapsText.visible = true;

            this.selectedButton = null;
            return;
        }
        
        if(this.selectedButton.name === 'start' && this.myReader.playerName!=='' && this.player1Vehicle!==null && this.player2Vehicle!==null) {
            // Iniciar jogo
            this.gameState = this.states.Playing;
            this.mainSong.pause();
            this.mainSong.currentTime = 0;
            this.mainSong.src = "assets/sounds/race_song.mp3";
            this.mainSong.volume = 0.5;
            this.mainSong.play();
            this.raycaster.layers.set(1);
            this.intersectedObj = null;
            this.selectedButton = null;
        }
    }

    updateLaps() {
        let manualCrossedFinishLine = this.myReader.manualCar.node.position.x >= -0.5 && this.myReader.manualCar.node.position.x <= 0.5 && this.myReader.manualCar.node.position.z >= -2 && this.myReader.manualCar.node.position.z <= 2;
        let autonomousCrossedFinishLine = this.myReader.autonomousCar.node.position.x >= -0.5 && this.myReader.autonomousCar.node.position.x <= 0.5 && this.myReader.autonomousCar.node.position.z >= -2 && this.myReader.autonomousCar.node.position.z <= 2;

        // ATUALIZAR O NÚMERO DE VOLTAS QUE CADA CARRO JÁ DEU
        const totalLaps = this.myReader.laps;

        if(this.myReader.manualCar && this.myReader.manualCarLaps<totalLaps && !this.myReader.manualCarLapsUpdated && manualCrossedFinishLine) {
            this.myReader.manualCarLaps += 1;
            this.myReader.manualCarLapsUpdated = true;
            console.log("Updated manual car laps: ", this.myReader.manualCarLaps);
        } else if(this.myReader.manualCar && this.myReader.manualCarLapsUpdated && !manualCrossedFinishLine) {
            this.myReader.manualCarLapsUpdated = false;
        }

        if(this.myReader.autonomousCar && this.myReader.autonomousCarLaps<totalLaps && !this.myReader.autonomousCarLapsUpdated && autonomousCrossedFinishLine) {
            this.myReader.autonomousCarLaps += 1;
            this.myReader.autonomousCarLapsUpdated = true;
            console.log("Updated autonomous car laps: ", this.myReader.autonomousCarLaps);
        } else if(this.myReader.autonomousCar && this.myReader.autonomousCarLapsUpdated && !autonomousCrossedFinishLine) {
            this.myReader.autonomousCarLapsUpdated = false;
            console.log("À espera de novo update");
        }

        
        // CARRO MANUAL TERMINOU A CORRIDA
        if(this.myReader.manualCarLaps === totalLaps && this.myReader.manualCarFinishTime === 0) {
            // Calculate time elapsed since launch
            let elapsedSeconds = (Date.now() - this.myReader.startTime) / 1000;
            this.myReader.manualCarFinishTime = elapsedSeconds;
            this.gameState = this.states.Waiting;
            console.log("Manual car finished");
        }


        // CARRO AUTÓNOMO TERMINOU A CORRIDA
        if(this.myReader.autonomousCarLaps === totalLaps && this.myReader.autonomousCarFinishTime === 0) {
            // Calculate time elapsed since launch
            let elapsedSeconds = (Date.now() - this.myReader.startTime) / 1000;
            this.myReader.autonomousCarFinishTime = elapsedSeconds;
            this.myReader.autonomousCar.mixerPause = true;
            console.log("Autonomous car finished");
        }

        // MUDAR O ESTADO DO JOGO SE OS DOIS CARROS JÁ TIVEREM TERMINADO
        if(this.myReader.manualCarLaps === totalLaps && this.myReader.autonomousCarLaps === totalLaps) {
            this.gameState = this.states.GameOver;
            this.myReader.setVisibleLayers([]);
        }
    }        

    checkIfInTrack() {
        const vehicle = this.myReader.manualCar.node;
        const pos = new THREE.Vector3(vehicle.position.x, 2, vehicle.position.z);
        const track = this.myReader.track;
        const collisions = new THREE.Raycaster(pos, new THREE.Vector3(0, -1, 0), 0, 10).intersectObject(track.mesh);
        if (collisions.length > 0) {
            this.myReader.manualCar.inTrack = true;
            return true;
        } else {
            this.myReader.manualCar.inTrack = false;
            return false;
        }

    }

    tryingToResetSpeed() {
        if (Date.now() - this.lastUpdate[0] > 5000 && this.myReader.manualCar) {
            this.myReader.manualCar.maxSpeed = this.myReader.manualCar.maxPossibleSpeed;
            this.mirrored = false;
            this.shield = false;
            this.myReader.manualCar.sphere.visible = false;
            this.img.remove();
        }
    }

    playingState() {
        this.tryingToResetSpeed();
        this.myReader.obstaclesReader.updateShader(this.clock.getElapsedTime());


        if (this.myReader.manualCar) {
            if (this.checkIfInTrack()) {
                if (Date.now() - this.lastUpdate[0] > 5000 || this.lastUpdate[0] === undefined) {
                    this.myReader.manualCar.maxSpeed = this.myReader.manualCar.maxPossibleSpeed;
                }
            }
            else {
                this.myReader.manualCar.maxSpeed = this.myReader.manualCar.maxPossibleSpeed * 0.125;
                let currentVelocity = this.myReader.manualCar.velocity;
                let newVelocity = currentVelocity.multiplyScalar(0.125);
                this.myReader.manualCar.velocity = newVelocity;
            }
        }

        if (this.myReader.visibleLayers.length === 0) {
            this.myReader.setVisibleLayers(['track', 'vehicles', 'obstacles', 'power-ups']);
            const lapsNum = this.selectedLaps[this.selectedLaps.length - 1];
            this.myReader.startGame(this.player1Vehicle.name, this.player2Vehicle.name, this.selectedLevel, lapsNum);
            this.myReader.moveOutdoorDisplay();
        }

        this.myReader.atualizarTempoDecorrido();
        this.updateLaps();

        this.processKeys();

        if (this.myReader.manualCar) {
            this.myReader.manualCar.update();
        }

        if (this.myReader.autonomousCar) {
            this.myReader.autonomousCar.update();
        }

        if (this.carCollision()) {
            this.gameState = this.states.CarCollision;
            let velocityCar = this.myReader.manualCar.maxSpeed;
            let new_velocityCar = velocityCar * 0.3;
            this.myReader.manualCar.maxSpeed = new_velocityCar;
            this.lastUpdate = [Date.now(), this.myReader.manualCar.maxSpeed];
        }

        if (this.obstaclesCollision()) {
            if (this.shield) {
                this.shield = false;
                this.myReader.manualCar.sphere.visible = false;
                this.img.remove();
            }
            else {
                this.gameState = this.states.ObstacleCollision;
                let obstacleName = this.obstaclesCollision();
                let name = obstacleName["name"];
                switch (name) {
                    case "spikes":
                        this.soundEffect.src = "assets/sounds/spikes_sound_effect.mp3";
                        this.img.src = "assets/activePowerup/spikes.png";
                        this.img.style.position = "absolute";
                        this.img.style.width = "15%";
                        this.img.style.left = "40%";
                        this.img.style.top = "-10%";
                        this.canvas.appendChild(this.img);                
                        let velocity = this.myReader.manualCar.maxSpeed;
                        let new_velocity = velocity * 0.3;
                        this.myReader.manualCar.maxSpeed = new_velocity;
                        this.lastUpdate = [Date.now(), this.myReader.manualCar.maxSpeed];
                        break;
                    case "oil_spill":
                        this.img.src = "assets/activePowerup/oil_spill.png";
                        this.img.style.position = "absolute";
                        this.img.style.width = "15%";
                        this.img.style.left = "40%";
                        this.img.style.top = "-10%";
                        this.canvas.appendChild(this.img); 
                        this.soundEffect.src = "assets/sounds/oil_spill_sound_effect.mp3";
                        this.mirrored = true;
                        this.lastUpdate = [Date.now(), this.myReader.manualCar.maxSpeed];
                        break;
                    case "tires":
                        this.soundEffect.src = "assets/sounds/tires_sound_effect.mp3";
                        let velocity_vector = this.myReader.manualCar.velocity;
                        this.myReader.manualCar.velocity.subVectors(new THREE.Vector3(0, 0, 0), velocity_vector);
                        break;
                }
            }
        }

        if (this.powerUpsCollision()) {
            this.gameState = this.states.SelectingObstcale;
            let powerUpName = this.powerUpsCollision();
            let name = powerUpName["name"];
            switch (name) {
                case "turboCan":
                    let velocity = this.myReader.manualCar.maxSpeed;
                    let new_velocity = velocity * 1.125;
                    this.myReader.manualCar.maxSpeed = new_velocity;
                    break;
                case "shield":
                    this.shield = true;
                    this.myReader.manualCar.sphere.visible = true;
                    this.myReader.manualCar.sphere.material.color = "#ffffff";
                    break;
                case "maxTurbo":
                    let maxvelocity = this.myReader.manualCar.maxSpeed;
                    let new_maxvelocity = maxvelocity * 1.25;
                    this.myReader.manualCar.maxSpeed = new_maxvelocity;
                    break;
            }
            console.log("Aplicar efeito de colisão com um power-up");
        }
    }

    selectingObstacleState() {
        // Mudar a cena para o parque de obstáculos caso ainda não o tenha feito
        if (this.myReader.visibleLayers.length !== 0) {
            console.log("--------------------------------");
            console.log("Inside state selecting obstacle");
            this.myReader.setVisibleLayers([]);
            this.myReader.drawObstaclePark();
            this.raycaster.layers.set(3);
        }

        // Quando o obstáculo for selecionado mudar de estado
        if (this.intersectedObj !== null) {
            this.myReader.exitObstaclePark();
            this.selectedObstacle = this.intersectedObj;

            // Reset das variáveis de interseção do raycaster
            this.intersectedObj = null;
            this.raycaster.layers.set(1);

            this.gameState = this.states.SelectingPosition;
        }
    }

    selectingPositionState() {
        // Mudar a cena para a layer das posições caso ainda não o tenha feito
        if (this.myReader.visibleLayers.length !== 1) {
            console.log("--------------------------------");
            console.log("Inside state selecting position");
            this.myReader.setVisibleLayers(['track']);
            this.myReader.drawPositionsLayer();
            this.raycaster.layers.set(4);
        }

        if (this.intersectedObj !== null) {
            this.myReader.exitPositionsLayer();

            const position = this.intersectedObj.position;
            this.myReader.route.removePositionFromAvailable([position.x, position.y, position.z]);

            // Adicionar obstáculo à pista
            this.myReader.obstaclesReader.createNewObstacle(this.selectedObstacle.name, [position.x, position.y, position.z]);

            // Reset das variáveis de interseção do raycaster
            this.intersectedObj = null;
            this.selectedObstacle = null;
            this.raycaster.layers.set(1);

            // Mudar a cena para a pista completa
            this.myReader.setVisibleLayers(['vehicles', 'obstacles', 'power-ups', 'track']);
            this.myReader.drawObstaclesLayer();

            this.gameState = this.states.PowerUpCollision;

        }
    }

    carCollisionState() {

        this.processKeys();

        if (this.myReader.manualCar) {
            this.myReader.manualCar.update();
        }

        if (this.myReader.autonomousCar) {
            this.myReader.autonomousCar.update();
        }

        if (this.carCollision() === false) {
            console.log("Volta ao estado de Playing");
            this.lastUpdate = [Date.now(), this.myReader.manualCar.maxSpeed];
            this.gameState = this.states.Playing;
        }
    }

    obstacleCollisionState() {
        this.processKeys();

        if (this.myReader.manualCar) {
            this.myReader.manualCar.update();
        }

        if (this.myReader.autonomousCar) {
            this.myReader.autonomousCar.update();
        }

        if (this.obstaclesCollision() === null) {
            console.log("Volta ao estado de Playing");
            this.gameState = this.states.Playing;
        }
    }

    powerUpCollisionState() {
        this.processKeys();

        if (this.myReader.manualCar) {
            this.myReader.manualCar.update();
        }

        if (this.myReader.autonomousCar) {
            this.myReader.autonomousCar.update();
        }

        if (this.powerUpsCollision() === null) {
            console.log("Volta ao estado de Playing");
            this.gameState = this.states.Playing;
        }
    }

    // Verificar colisão com carro autónomo
    carCollision() {
        if (this.myReader.autonomousCar && this.collision(this.myReader.autonomousCar)) {
            return true;
        }

        return false;
    }

    // Retorna o obstáculo com o qual ocorreu a colisão
    // Retorna nulo se não tiver ocorrido colisão com nenhum obstáculo
    obstaclesCollision() {
        for (var name in this.myReader.obstaclesReader.tracksObstacles) {
            const obstacle = this.myReader.obstaclesReader.tracksObstacles[name];

            if (obstacle.sphere && this.collision(obstacle)) {
                return (obstacle);
            }
        }

        return null;
    }

    // Retorna o power-up com o qual ocorreu a colisão
    // Retorna nulo se não tiver ocorrido colisão com nenhum power-up
    powerUpsCollision() {
        for (var name in this.myReader.powerUpsReader.objs) {
            const powerUp = this.myReader.powerUpsReader.objs[name];

            if (powerUp.sphere && this.collision(powerUp)) {
                return powerUp;
            }
        }

        return null;
    }

    collision(object) {
        if (object.vehicleObject !== undefined) {
            object = object.vehicleObject;
        }
        const distancia = this.myReader.manualCar.sphere.position.distanceTo(object.sphere.position);
        const somaRaios = this.myReader.manualCar.raioEnvolvente + object.raioEnvolvente;

        return distancia <= somaRaios;
    }

    update() {
        this.myReader.updateScene();

        switch (this.gameState) {
            case this.states.Start:
                this.startState();
                break;

            case this.states.Playing:
                this.playingState();
                break;

            case this.states.Pause:
                break;

            case this.states.GameOver:
                this.gameoverState();
                break;

            case this.states.Waiting:
                this.waitingState();
                break;

            case this.states.ObstacleCollision:
                // Função que muda o estado para Playing assim que não houver nenhuma colisão de obstáculos detetada
                this.obstacleCollisionState();
                break;

            case this.states.CarCollision:
                // Chamar função que muda o estado para Playing assim que não houver nenhuma colisão de carros detetada
                this.carCollisionState();
                break;

            case this.states.PowerUpCollision:
                // Chamar função que muda o estado para Playing assim que não houver nenhuma colisão de power ups detetada
                this.powerUpCollisionState();
                break;

            case this.states.SelectingObstcale:
                this.selectingObstacleState();
                break;

            case this.states.SelectingPosition:
                this.selectingPositionState();
                break;

            default:
                console.log("Estado desconhecido");
        }
    }

    changeButtonColor(button) {
        if (this.selectedButton) {
            this.selectedButton.children[0].material.color.setHex('0xFF0000');
        }

        if(button.name !== 'level' && button.name !== 'laps')
            button.children[0].material.color.setHex('0x00FF00');
    }

    pickingHelper(intersects) {
        if (intersects.length > 0 && this.intersectedObj === null) {
            const obj = intersects[0].object;
            this.intersectedObj = this.findAncestorGroup(obj);
        }
    }

    findAncestorGroup(object) {
        if (object === null || object === undefined) {
            return null;
        }

        // Objeto é do tipo Mesh e é filho direto da cena
        if (object instanceof THREE.Mesh && object.parent === this.app.scene) {
            return object;
        }

        // Objeto é um dos botões do outdoor display
        if (object instanceof THREE.Group && object.parent === this.myReader.outdoorDisplay) {
            // Mudar cor do botão anteriormente selecionado para vermelho
            // Mudar cor do novo botão selecionado para verde
            this.changeButtonColor(object);
            return object;
        }

        // Verifique se o objeto é do tipo Group e se é o grupo desejado
        if (object instanceof THREE.Group && object.parent === this.app.scene) {
            return object;
        } else {
            // Chame recursivamente a função para o pai do objeto
            return this.findAncestorGroup(object.parent);
        }
    }

    onPointerDown(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.app.getActiveCamera());

        //3. compute intersections
        var intersects = this.raycaster.intersectObjects(this.app.scene.children, true);

        this.pickingHelper(intersects)
    }
}

export { MyContents };