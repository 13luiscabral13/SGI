import * as THREE from 'three';
import { MyContents } from './MyContents.js';
import { MyVehiclesReader } from './layer-vehicles/MyVehiclesReader.js';
import { MyObstaclesReader } from './layer-obstacles/MyObstaclesReader.js';
import { MyAutonomousVehicle } from './layer-vehicles/MyAutonomousVehicle.js';
import { MyPowerUpsReader } from './layer-power-ups/MyPowerUpsReader.js';
import { MyTrack } from './layer-track/MyTrack.js';
import { MyRoute } from './layer-routes/MyRoute.js';
import { MyShader } from './MyShader.js';
import { MyPlane } from './MyPlane.js';


class MyReader {
    /**
       constructs the object
       @param {MyContents} contents The app object
    */
    constructor(app) {
        this.app = app;
        this.displacementFactor = 1;
        this.displayShader = null;
        this.shaderTexture = null;
        this.textureRGB = null;
        this.textureLgray = null;
        this.track = new MyTrack(app);
        this.route = new MyRoute(app);
        this.vehiclesReader = new MyVehiclesReader(app);
        this.obstaclesReader = new MyObstaclesReader(app);
        this.powerUpsReader = new MyPowerUpsReader(app);
        this.init();

        this.visibleLayers = [];
    }

    updateDisplacementFactor(value) {
        this.displacementFactor = value;
        this.displayShader.updateUniformsValue("displacementFactor", this.displacementFactor);
    }

    updateShaderTexture(value) {
        if (value == "Rapid Racer Logo") {
            this.textureRGB = new THREE.TextureLoader().load('textures/rapidracer.jpg');
            this.textureLgray = new THREE.TextureLoader().load('textures/rapidracerlgray.jpg');
        }
        else if (value == "F1 Cars") {
            this.textureRGB = new THREE.TextureLoader().load('textures/f1_cars.jpg');
            this.textureLgray = new THREE.TextureLoader().load('textures/f1_cars_lgray.jpg');
        }
        else if (value == "Leclerc") {
            this.textureRGB = new THREE.TextureLoader().load('textures/leclerc.jpg');
            this.textureLgray = new THREE.TextureLoader().load('textures/leclerclgray.jpg');
        }
        else if (value == "Ayrton Senna") {
            this.textureRGB = new THREE.TextureLoader().load('textures/senna.jpeg');
            this.textureLgray = new THREE.TextureLoader().load('textures/sennalgray.jpg');
        }
        else if (value == "Parrot") {
            this.textureRGB = new THREE.TextureLoader().load('textures/parrot.jpg');
            this.textureLgray = new THREE.TextureLoader().load('textures/parrotlgray.jpg');
        }

        this.displayShader.updateUniformsValue("uSampler1", this.textureRGB);
        this.displayShader.updateUniformsValue("uSampler2", this.textureLgray);
    }

    async init() {
        await this.waitForDisplayShaderReady();
        console.log(this.displayShader.material);
        this.drawGameBackground();
    }

    async waitForDisplayShaderReady() {
        this.shaderTexture = "Rapid Racer Logo";
        this.textureRGB = new THREE.TextureLoader().load('textures/rapidracer.jpg');
        this.textureLgray = new THREE.TextureLoader().load('textures/rapidracerlgray.jpg');

        this.displayShader = new MyShader(this.app, 'Grayscale Shader', "Use LGray image to create a heightmap", "shaders/display.vert", "shaders/display.frag", {
            uSampler1: { type: 'sampler2D', value: this.textureRGB },
            uSampler2: { type: 'sampler2D', value: this.textureLgray },
            normScale: { type: 'f', value: 1 },
            displacementFactor: { type: 'f', value: this.displacementFactor },
            normalizationFactor: { type: 'f', value: 1 },
            blendScale: { type: 'f', value: 0 },
            timeFactor: { type: 'f', value: 0.0 },
            scale: { type: 'f', value: 1.0 },
        });
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.displayShader.ready) {
                    console.log("READY");
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    async startCountdown() {
        let count = 5;
        var firstHorn = new Audio('assets/sounds/firstHorn.mp3');
        var lastHorn = new Audio('assets/sounds/lastHorn.mp3');
        const canvas = document.getElementById("canvas");
        let img = document.createElement("img");
        img.src = "assets/trafficLights/" + String(count) + ".png";
        img.style.position = "absolute";
        img.style.width = "15%";
        img.style.left = "40%";
        img.style.top = "-10%";
        canvas.appendChild(img);
        const countdown = () => {
            if (count > 0) {
                img.src = "assets/trafficLights/" + String(count) + ".png";
                count--;
                if (count < 4) {
                    firstHorn.play();
                }   

                setTimeout(countdown, 1000); // Wait for 1 second
            } else {
                img.src = "assets/trafficLights/" + String(count) + ".png";
                lastHorn.play();
                this.autonomousCar.mixerPause = false;
                this.manualCar.canMove = true;
                setTimeout(() => {
                    img.remove();
                }, 1000);
                return "Finished";
                // Start the game logic here
            }
        };

        countdown();
    }
    // Function to start the countdown

    setGameVariables(restartSameGame = false) {
        const backgroundIndex = this.app.scene.children.findIndex(child => child.name === 'background');

        // Apagar da cena todos os filhos que são relativos a um jogo (aparecem depois do filho com nome 'background')
        if (backgroundIndex !== -1 && backgroundIndex < this.app.scene.children.length - 1) {
            const childrenToRemove = this.app.scene.children.slice(backgroundIndex + 1);

            for (const child of childrenToRemove) {
                if(child instanceof THREE.Mesh || child instanceof THREE.Group || child instanceof THREE.Points)
                    this.app.scene.remove(child);
            }
        }

        if(!restartSameGame) {
            this.manualCar = null;
            this.autonomousCar = null;
            this.playerName = '';
        }

        // Colocar todas as posições como disponíveis outra vez
        this.route.setAllPositionsAvailable();

        this.drawBackground();

        this.visibleLayers = [];

        this.fireworks = [];
        
        this.manualCarLaps = 0;
        this.autonomousCarLaps = 0;

        this.manualCarLapsUpdated = true;
        this.autonomousCarLapsUpdated = true;

        this.manualCarFinishTime = 0;
        this.autonomousCarFinishTime = 0;

        this.startTime = 0;
    }


    async startGame(player1Vehicle, player2Vehicle, level, laps) {
        console.log("Starting game");

        //Nível de dificuldade
        this.level = level; 

        // Nº de voltas do jogo
        this.laps = parseInt(laps);

        // Começar a contar o tempo de jogo
        this.startTime = Date.now();

        this.tempoDecorridoSegundos = 0;
        this.ultimoTempo = performance.now();
        this.segundosPassados = 0;

        // Colocar o carro manual na pista
        this.manualCar = this.vehiclesReader.objs[player1Vehicle];
        this.addVehicleToScene(player1Vehicle);
        this.app.activeCamera.position.set(this.manualCar.node.position.x, this.manualCar.node.position.y + 3, this.manualCar.node.position.z);
        this.autonomousCar = new MyAutonomousVehicle(this.app, this.vehiclesReader.objs[player2Vehicle]);
        this.addVehicleToScene(player2Vehicle);

        // Colocar obstáculos na pista
        for(var name in this.obstaclesReader.objs) {
            const position = this.route.chooseRandomPosition();
            this.obstaclesReader.createNewObstacle(name, position);
        }

        // Adicionar obstáculos que estão na pista à cena
        for (var name in this.obstaclesReader.tracksObstacles) {
            this.obstaclesReader.addObstacleToScene(this.obstaclesReader.tracksObstacles[name], true);
        }

        // Adicionar power-ups à cena
        for (var name in this.powerUpsReader.objs) {
            const position = this.route.chooseRandomPosition();
            this.powerUpsReader.addPowerUp(name, position);
        }

        this.manualCar.canMove = false;
        this.autonomousCar.mixerPause = true;
        await this.startCountdown();
    }

    addVehicleToScene(name) {
        // Dar reset das variáveis do veículo
        this.vehiclesReader.objs[name].resetCarVariables();

        // Colocar veículo na posição inicial na pista
        const node = this.vehiclesReader.objs[name].node;
        node.scale.set(1, 1, 1);
        node.position.set(0, this.vehiclesReader.objs[name].height, 0);
        this.app.scene.add(node);

        // Criar volume envolvente
        if(this.vehiclesReader.objs[name].sphere === null) {
            console.log("A criar esfera para o carro: ", name);
            const raio = this.vehiclesReader.objs[name].raioEnvolvente;
            const volume = this.createVolume(node, raio);
            this.vehiclesReader.objs[name].sphere = volume;
        }
        
        this.app.scene.add(this.vehiclesReader.objs[name].sphere);
    }

    // Adicionar os obstáculos à cena
    addObstacles() {

        for (var name in this.obstaclesReader.objs) {
            // Obter o grupo e raio do obstáculo
            const node = this.obstaclesReader.objs[name].node;
            const raio = this.obstaclesReader.objs[name].raioEnvolvente;

            //Cria o volume envolvente necessário para a deteção de colisões
            const volume = this.createVolume(node, raio);

            this.obstaclesReader.objs[name].sphere = volume;

            this.app.scene.add(node);
            this.app.scene.add(volume);
        }
    }

    // Cria uma esfera envolvente para um dado objeto
    // Esta esfera é usada para detetar colisões
    createVolume(object, raio) {
        // Criar uma mesh para a esfera (apenas para renderização)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const esferaMesh = new THREE.Mesh(new THREE.SphereGeometry(raio, 32, 32), material);
        esferaMesh.position.copy(object.position);
        esferaMesh.visible = false;
        return esferaMesh;
    }

    formatarTempoDecorrido(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = Math.floor(segundos) % 60;

        const minutosFormatados = minutos < 10 ? `0${minutos}` : minutos;
        const segundosFormatados = segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes;

        return [`${minutosFormatados}m`, `${segundosFormatados}s`];
    }

    atualizarTempoDecorrido() {
        const agora = performance.now();
        const deltaTempo = (agora - this.ultimoTempo) / 1000;

        this.tempoDecorridoSegundos += deltaTempo;

        this.ultimoTempo = agora;

        // Aumentar a contagem de segundos
        this.segundosPassados += deltaTempo;

        if (this.segundosPassados >= 1) {
            // Se passou pelo menos 1 segundo, atualize o placar
            this.atualizarPlacar();
            this.segundosPassados -= 1; // Reiniciar a contagem
        }
    }

    atualizarPlacar() {
        const time = this.formatarTempoDecorrido(this.tempoDecorridoSegundos);
        const mins = time[0];
        const secs = time[1];

        let numFinishedLaps = 0;
        const laps = numFinishedLaps.toString() + '/' + this.laps.toString();

        let maxVelocity = 100;
        let velocity = 50;

        this.drawTime(mins, secs);
        //this.drawLaps(laps);
        //this.drawMaxVelocity(maxVelocity.toString());
        //this.drawVelocity(velocity.toString());
    }

    drawGameBackground() {
        this.drawOutdoorDisplay();
        this.drawRapidRacerDisplay();
        this.drawGameTitle();
        this.drawCreators();
        this.drawYourName();
        this.drawPlayer1Vehicle();
        this.drawPlayer2Vehicle();
        this.drawPlayer1Button();
        this.drawPlayer2Button();
        this.drawNameButton();
        this.drawStartButton();
        this.drawLevelButton();
        this.drawLapsButton();
    }

    drawBackground() {
        const backgroundGroup = new THREE.Group();
        backgroundGroup.name = "background";

        const planeGeometry = new THREE.PlaneGeometry(105, 105);
        const planeGeometry2 = new THREE.PlaneGeometry(105, 40);

        const groundTexture = new THREE.TextureLoader().load('layer-track/textures/ground.jpg');
        const backgroundTexture = new THREE.TextureLoader().load('layer-track/textures/background-people.jpg');

        const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture, side: THREE.DoubleSide });
        const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.DoubleSide });

        const groundMesh = new THREE.Mesh(planeGeometry, groundMaterial);
        groundMesh.rotation.set(Math.PI / 2, 0, 0);

        const backgroundMeshfront = new THREE.Mesh(planeGeometry2, backgroundMaterial);
        const backgroundMeshback = backgroundMeshfront.clone();
        const backgroundMeshleft = backgroundMeshfront.clone();
        const backgroundMeshright = backgroundMeshfront.clone();

        backgroundMeshfront.rotation.set(0, Math.PI / 2, 0);
        backgroundMeshfront.position.set(-52.5, 20, 0);

        backgroundMeshback.rotation.set(0, -Math.PI / 2, 0);
        backgroundMeshback.position.set(52.5, 20, 0);

        backgroundMeshleft.position.set(0, 20, 52.5);

        backgroundMeshright.position.set(0, 20, -52.5);

        backgroundGroup.add(groundMesh);
        backgroundGroup.add(backgroundMeshfront);
        backgroundGroup.add(backgroundMeshback);
        backgroundGroup.add(backgroundMeshleft);
        backgroundGroup.add(backgroundMeshright);

        backgroundGroup.position.set(-4, 0, -35);

        this.app.scene.add(backgroundGroup);
    }

    drawLoserPlatform(loserName) {
        const platformGroup = new THREE.Group();

        const platformGeometry = new THREE.BoxGeometry();
        const platformTexture = new THREE.TextureLoader().load('layer-track/textures/platform.jpg');
        const platformMaterial = new THREE.MeshBasicMaterial({map: platformTexture, color: "#D10000"});

        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.scale.set(10, 5, 8);

        const planeGeometry = new THREE.PlaneGeometry(7, 4);
        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF)});
        const planeMesh = new THREE.Mesh(planeGeometry, materialBranco);
        planeMesh.rotation.set(0, Math.PI/2, 0);
        planeMesh.position.set(5.05, 0, 0);

        const nameGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("2");

        const wordMesh2 = this.buildWord(loserName);

        wordMesh1.scale.set(2, 2, 1);
        wordMesh1.rotation.set(0, Math.PI/2, 0);
        wordMesh1.position.set(5.1, 0.8, 0);

        nameGroup.add(wordMesh2);
        nameGroup.scale.set(0.8, 1, 1);
        nameGroup.rotation.set(0, Math.PI/2, 0);
        nameGroup.position.set(5.1, -1, loserName.length * 0.8 / 2 - 0.3);

        platformGroup.add(platform);
        platformGroup.add(planeMesh);
        platformGroup.add(wordMesh1);
        platformGroup.add(nameGroup);

        return platformGroup;
    }

    drawWinnerPlatform(winnerName) {
        const platformGroup = new THREE.Group();

        const platformGeometry = new THREE.BoxGeometry();
        const platformTexture = new THREE.TextureLoader().load('layer-track/textures/platform.jpg');
        const platformMaterial = new THREE.MeshBasicMaterial({map: platformTexture, color: "#D10000"});

        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.scale.set(10, 7, 8);

        const planeGeometry = new THREE.PlaneGeometry(7, 6);
        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF)});
        const planeMesh = new THREE.Mesh(planeGeometry, materialBranco);
        planeMesh.rotation.set(0, Math.PI/2, 0);
        planeMesh.position.set(5.05, 0, 0);

        const nameGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("1");

        const wordMesh2 = this.buildWord(winnerName);
        wordMesh2.position.set(0, 1, 0);

        wordMesh1.scale.set(2, 2, 1);
        wordMesh1.rotation.set(0, Math.PI/2, 0);
        wordMesh1.position.set(5.1, 1.5, 0);

        nameGroup.add(wordMesh2);
        nameGroup.scale.set(0.8, 1, 1);
        nameGroup.rotation.set(0, Math.PI/2, 0);
        nameGroup.position.set(5.1, -2.3, winnerName.length * 0.8 / 2 - 0.2);

        platformGroup.add(platform);
        platformGroup.add(planeMesh);
        platformGroup.add(wordMesh1);
        platformGroup.add(nameGroup);

        return platformGroup;
    }

    gameoverOutdoorDisplay() {
        for (let i = this.outdoorDisplay.children.length - 1; i >= 5; i--) {
            this.outdoorDisplay.remove(this.outdoorDisplay.children[i]);
        }
        
        this.outdoorDisplay.position.x += 25;

        let time = this.formatarTempoDecorrido(this.manualCarFinishTime);
        let mins = time[0];
        let secs = time[1];

        const player1Info = this.drawPlayerInfo(this.playerName, this.manualCar.name, mins, secs);
        player1Info.position.set(0, -0.5, 4.5);

        time = this.formatarTempoDecorrido(this.autonomousCarFinishTime);
        mins = time[0];
        secs = time[1];

        const player2Info = this.drawPlayerInfo("PLAYER 2", this.autonomousCar.vehicleObject.name, mins, secs);
        player2Info.position.set(0, -0.5, -11.7);

        this.outdoorDisplay.add(player1Info);
        this.outdoorDisplay.add(player2Info);

        const boxGeometry = new THREE.BoxGeometry();
        const planeGeometry1 = new THREE.PlaneGeometry(1, 1);
        const planeGeometry2 = new THREE.PlaneGeometry(1, 1);

        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });
        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF)});
        const materialPreto = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x000000)});

        const levelGroup = new THREE.Group();

        const levelMeshBlack = new THREE.Mesh(planeGeometry1, materialPreto);
        const levelMeshWhite = new THREE.Mesh(planeGeometry2, materialBranco);

        levelMeshWhite.position.set(0, 0, 0.1);

        const levelTextGroup = new THREE.Group();

        const text1 = this.buildWord("DIFICULTY");
        const text2 = this.buildWord("LEVEL:");
        const text3 = this.buildWord(this.level.toUpperCase());

        text1.position.set(0, 1, 0);
        text2.position.set(9.5, 1, 0);
        text3.position.set(16, 1, 0);

        levelTextGroup.add(text1);
        levelTextGroup.add(text2);
        levelTextGroup.add(text3);

        levelTextGroup.scale.set(0.6, 0.8, 1);

        levelGroup.add(levelMeshBlack);
        levelGroup.add(levelMeshWhite);
        levelGroup.add(levelTextGroup);

        if(this.level === 'beginner') {
            levelMeshBlack.scale.set(14.8, 1.5, 1);
            levelMeshWhite.scale.set(14.6, 1.3, 1);

            levelTextGroup.position.set(-6.8, -0.8, 0.2);
        } else if (this.level === 'intermediate') {
            levelMeshBlack.scale.set(17.5, 1.5, 1);
            levelMeshWhite.scale.set(17.3, 1.3, 1);

            levelTextGroup.position.set(-8.1, -0.8, 0.2);
        } else if (this.level === 'expert') {
            levelMeshBlack.scale.set(14, 1.5, 1);
            levelMeshWhite.scale.set(13.8, 1.3, 1);

            levelTextGroup.position.set(-6.3, -0.8, 0.2);
        }

        levelGroup.rotation.set(0, Math.PI/2, 0);
        levelGroup.position.set(2.5, 18.2, 0);

        const menuButtonGroup = new THREE.Group();

        const buttonMesh = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh.scale.set(0.5, 2, 4);
        buttonMesh.position.set(0, 0, -1.3);
        menuButtonGroup.add(buttonMesh);

        const wordGroup = this.buildWord("MENU");
        wordGroup.scale.set(0.8, 1.2, 1);
        wordGroup.rotation.set(0, Math.PI/2, 0);
        wordGroup.position.set(0.3, 0, 0);
        menuButtonGroup.add(wordGroup);

        menuButtonGroup.position.set(2.5, 10, -2);

        const playAgainButtonGroup = new THREE.Group();

        const buttonMesh2 = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh2.scale.set(0.5, 2, 8.9);
        buttonMesh2.position.set(0, 0, -3.6);
        playAgainButtonGroup.add(buttonMesh2);

        const wordGroup2 = new THREE.Group();
        const wordMesh1 = this.buildWord("PLAY AGAIN");

        wordMesh1.position.set(0, 1, 0);

        wordGroup2.add(wordMesh1);
        wordGroup2.scale.set(0.8, 1.2, 1);
        wordGroup2.rotation.set(0, Math.PI/2, 0);
        wordGroup2.position.set(0.3, -1.2, 0);
        playAgainButtonGroup.add(wordGroup2);

        playAgainButtonGroup.position.set(2.5, 10, 8.5);

        // COLOCAR LAYER 5 NO MENU BUTTON GROUP E PLAY AGAIN BUTTON GROUP
        playAgainButtonGroup.name = 'play_again';
        this.enableLayers(playAgainButtonGroup, 5);

        menuButtonGroup.name = 'menu';
        this.enableLayers(menuButtonGroup, 5);

        this.outdoorDisplay.add(levelGroup);
        this.outdoorDisplay.add(menuButtonGroup);
        this.outdoorDisplay.add(playAgainButtonGroup);

        this.drawPodium();
    }

    drawPodium() {
        let winner = this.manualCarFinishTime <= this.autonomousCarFinishTime ? this.playerName : "PLAYER 2";
        let loser = this.manualCarFinishTime <= this.autonomousCarFinishTime ? "PLAYER 2" : this.playerName;

        console.log("WINNER: ", winner);
        console.log("LOSER: ", loser);

        const winnerPlatform = this.drawWinnerPlatform(winner);
        winnerPlatform.scale.set(1, 0.6, 0.8);
        winnerPlatform.position.set(0, 2.1, -32);
        this.app.scene.add(winnerPlatform);

        const loserPlatform = this.drawLoserPlatform(loser);
        loserPlatform.scale.set(1, 0.6, 0.8);
        loserPlatform.position.set(0, 1.5, -42);
        this.app.scene.add(loserPlatform);

        console.log("Winner platform: ", winnerPlatform);
        console.log("Loser platform: ", loserPlatform);

        if(winner === this.playerName) {
            console.log("Drawing winner platform for player 1");
            this.manualCar.node.position.x = winnerPlatform.position.x;
            this.manualCar.node.position.y += 3.7;
            this.manualCar.node.position.z = winnerPlatform.position.z;
            this.manualCar.node.scale.set(5, 5, 5);

            this.autonomousCar.node.position.x = loserPlatform.position.x;
            this.autonomousCar.node.position.y += 2.4;
            this.autonomousCar.node.position.z = loserPlatform.position.z;
            this.autonomousCar.node.scale.set(5, 5, 5);
        } else {
            console.log("Drawing winner platform for player 2");
            this.autonomousCar.node.position.x = winnerPlatform.position.x;
            this.autonomousCar.node.position.y += 3.4;
            this.autonomousCar.node.position.z = winnerPlatform.position.z;
            this.autonomousCar.node.scale.set(5, 5, 5);

            this.manualCar.node.position.x = loserPlatform.position.x;
            this.manualCar.node.position.y += 2.7;
            this.manualCar.node.position.z = loserPlatform.position.z;
            this.manualCar.node.scale.set(5, 5, 5);
        }
    }

    drawPlayerInfo(name, vehicle, mins, secs) {
        console.log("Name: ", vehicle);

        const playerInfo = new THREE.Group();

        const playerGroup = new THREE.Group();
        const wordMesh1 = this.buildWord(name);
    
        wordMesh1.position.set(0, 1, 0);

        playerGroup.add(wordMesh1);
        playerGroup.rotation.set(0, Math.PI/2, 0);
        playerGroup.position.set(2.5, 16, 8);

        const playerVehicleGroup = new THREE.Group();
        const wordMesh3 = this.buildWord("VEHICLE:");
        const wordMesh4 = this.buildWord(vehicle);
        
        wordMesh3.position.set(0, 1, 0);
        wordMesh4.position.set(8.5, 1, 0);

        playerVehicleGroup.add(wordMesh3);
        playerVehicleGroup.add(wordMesh4);

        playerVehicleGroup.rotation.set(0, Math.PI/2, 0);
        playerVehicleGroup.scale.set(0.5, 0.8, 1);
        playerVehicleGroup.position.set(2.5, 14, 11);

        const playerTimeGroup = new THREE.Group();
        const wordMesh5 = this.buildWord("FINISH")
        const wordMesh6 = this.buildWord("TIME:");
        const wordMesh7 = this.buildWord(mins);
        const wordMesh8 = this.buildWord(secs);

        wordMesh5.position.set(0, 1, 0);
        wordMesh6.position.set(6.5, 1, 0);
        wordMesh7.position.set(11.5, 1, 0);
        wordMesh8.position.set(15, 1, 0);

        playerTimeGroup.add(wordMesh5);
        playerTimeGroup.add(wordMesh6);
        playerTimeGroup.add(wordMesh7);
        playerTimeGroup.add(wordMesh8);

        playerTimeGroup.rotation.set(0, Math.PI/2, 0);
        playerTimeGroup.scale.set(0.5, 0.8, 1);
        playerTimeGroup.position.set(2.5, 12, 11);

        playerInfo.add(playerGroup);
        playerInfo.add(playerVehicleGroup);
        playerInfo.add(playerTimeGroup);

        return playerInfo;
    }

    moveOutdoorDisplay() {
        for (let i = this.outdoorDisplay.children.length - 1; i >= 5; i--) {
            this.outdoorDisplay.remove(this.outdoorDisplay.children[i]);
        }

        this.outdoorDisplay.position.x -= 30;

        // TEXTO PARA TIME
        const timeMesh = this.buildWord("TIME:");

        timeMesh.position.set(0, 1, 0);
        timeMesh.rotation.set(0, Math.PI / 2, 0);
        timeMesh.scale.set(0.65, 0.8, 1);
        timeMesh.position.set(2.5, 16.8, 12.5);

        // TEXTO PARA COMPLETED LAPS
        const completedLapsGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("COMPLETED");
        const wordMesh2 = this.buildWord("LAPS:");

        wordMesh1.position.set(0, 1, 0);
        wordMesh2.position.set(9.5, 1, 0);

        completedLapsGroup.add(wordMesh1);
        completedLapsGroup.add(wordMesh2);

        completedLapsGroup.rotation.set(0, Math.PI / 2, 0);
        completedLapsGroup.scale.set(0.65, 0.8, 1);
        completedLapsGroup.position.set(2.5, 16, -2);

        // TEXTO PARA MAX VELOCITY
        const maxVelocityGroup = new THREE.Group();

        const wordMesh3 = this.buildWord("MAX");
        const wordMesh4 = this.buildWord("VELOCITY:");

        wordMesh3.position.set(0, 1, 0);
        wordMesh4.position.set(3.5, 1, 0);

        maxVelocityGroup.add(wordMesh3);
        maxVelocityGroup.add(wordMesh4);

        maxVelocityGroup.rotation.set(0, Math.PI / 2, 0);
        maxVelocityGroup.scale.set(0.65, 0.8, 1);
        maxVelocityGroup.position.set(2.5, 13.5, 12.5);

        // TEXTO PARA VELOCITY
        const velocityMesh = this.buildWord("VELOCITY:");

        velocityMesh.rotation.set(0, Math.PI / 2, 0);
        velocityMesh.scale.set(0.65, 0.8, 1);
        velocityMesh.position.set(2.5, 14.3, -2);

        this.outdoorDisplay.add(timeMesh);
        this.outdoorDisplay.add(completedLapsGroup);
        this.outdoorDisplay.add(maxVelocityGroup);
        this.outdoorDisplay.add(velocityMesh);

        this.timeTextGroup = new THREE.Group();
        this.lapsTextGroup = new THREE.Group();
        this.maxVelocityTextGroup = new THREE.Group();
        this.velocityTextGroup = this.maxVelocityTextGroup.clone();

        this.outdoorDisplay.add(this.timeTextGroup);
        this.outdoorDisplay.add(this.lapsTextGroup);
        this.outdoorDisplay.add(this.maxVelocityTextGroup);
        this.outdoorDisplay.add(this.velocityTextGroup);

    }

    drawTime(minutes, seconds) {
        this.timeTextGroup.clear();

        const wordMesh6 = this.buildWord(minutes);
        const wordMesh7 = this.buildWord(seconds);

        wordMesh6.position.set(0, 1, 0);
        wordMesh7.position.set(3.5, 1, 0);

        this.timeTextGroup.add(wordMesh6);
        this.timeTextGroup.add(wordMesh7);

        this.timeTextGroup.rotation.set(0, Math.PI / 2, 0);
        this.timeTextGroup.scale.set(0.65, 0.8, 1);
        this.timeTextGroup.position.set(2.5, 16, 9);
    }

    drawLaps(laps) {
        this.lapsTextGroup.clear();

        const wordMesh8 = this.buildWord(laps);

        wordMesh8.position.set(0, 1, 0);

        this.lapsTextGroup.add(wordMesh8);

        this.lapsTextGroup.rotation.set(0, Math.PI / 2, 0);
        this.lapsTextGroup.scale.set(0.65, 0.8, 1);
        this.lapsTextGroup.position.set(2.5, 16, -11.5);
    }

    drawMaxVelocity(maxVelocity) {
        this.maxVelocityTextGroup.clear();

        const wordMesh9 = this.buildWord(maxVelocity);
        const wordMesh10 = this.buildWord("km/s");

        wordMesh9.position.set(0, 1, 0);
        wordMesh10.position.set(3.5, 1, 0);

        this.maxVelocityTextGroup.add(wordMesh9);
        this.maxVelocityTextGroup.add(wordMesh10);

        this.maxVelocityTextGroup.rotation.set(0, Math.PI / 2, 0);
        this.maxVelocityTextGroup.scale.set(0.65, 0.8, 1);
        this.maxVelocityTextGroup.position.set(2.5, 13.5, 4);
    }

    drawVelocity(velocity) {
        this.velocityTextGroup.clear();

        const wordMesh9 = this.buildWord(velocity);
        const wordMesh10 = this.buildWord("km/s");

        wordMesh9.position.set(0, 1, 0);
        wordMesh10.position.set(3.5, 1, 0);

        this.velocityTextGroup.add(wordMesh9);
        this.velocityTextGroup.add(wordMesh10);

        this.velocityTextGroup.rotation.set(0, Math.PI / 2, 0);
        this.velocityTextGroup.scale.set(0.65, 0.8, 1);
        this.velocityTextGroup.position.set(2.5, 13.5, -8);
    }

    drawOutdoorDisplay() {
        this.outdoorDisplay = new THREE.Group();
        const boxGeometry = new THREE.BoxGeometry();

        // Criar o material cinza
        const materialCinza = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x808080) });
        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF) });

        const verticalPost = new THREE.Mesh(boxGeometry, materialCinza);
        const horizontalPost = verticalPost.clone();
        const screen = verticalPost.clone();
        const smallerScreen = new THREE.Mesh(boxGeometry, materialBranco);

        verticalPost.scale.set(0.5, 15, 0.5);
        verticalPost.position.set(0, 7.5, 0);
        this.outdoorDisplay.add(verticalPost);

        horizontalPost.scale.set(2, 0.5, 0.5);
        horizontalPost.position.set(0.75, 15, 0);
        this.outdoorDisplay.add(horizontalPost);

        screen.scale.set(0.5, 15, 34);
        screen.position.set(2, 15, 0);
        this.outdoorDisplay.add(screen);

        smallerScreen.scale.set(0.5, 13, 32);
        smallerScreen.position.set(2.1, 15, 0);
        this.outdoorDisplay.add(smallerScreen);
        this.outdoorDisplay.position.set(-5, 0, -37);

        this.app.scene.add(this.outdoorDisplay);
    }

    drawRapidRacerDisplay() {
        this.rapidRacerDisplay = new THREE.Group();
        const smallerScreen = new MyPlane(this.app, 40, 20, 50);

        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF) });
        const biggerScreen = new THREE.Mesh(new THREE.BoxGeometry(42, 22, 0.5), materialBranco);
        smallerScreen.mesh.material = this.displayShader.material;
        smallerScreen.mesh.material.needsUpdate = true;
        smallerScreen.mesh.rotation.set(0, Math.PI, 0);
        smallerScreen.mesh.position.set(-10.5, 15, 53.25);
        biggerScreen.rotation.set(0, Math.PI, 0);
        biggerScreen.position.set(-10.5, 15, 53.65);
        this.rapidRacerDisplay.add(biggerScreen);
        this.rapidRacerDisplay.add(smallerScreen.mesh);
        this.rapidRacerDisplay.position.set(10, 0, -37);
        this.app.scene.add(this.rapidRacerDisplay);
    }


    update() {

    }

    drawLetter(letter) {
        const letterMesh = this.buildWord(letter);
        letterMesh.position.set(this.playerName.length, 1, 0);
        this.playerName += letter;
        this.playerNameGroup.add(letterMesh);
    }

    eraseLetter() {
        if (this.playerNameGroup.children.length > 0) {
            // Remover o último filho do grupo e armazenar uma referência a ele
            this.playerName = this.playerName.slice(0, -1);
            this.playerNameGroup.children.pop();
        }
        else {
            console.log("O nome já está vazio");
        }
    }

    drawGameTitle() {
        const titleGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("RAPID");
        const wordMesh2 = this.buildWord("RACER");
        const wordMesh3 = this.buildWord("X");

        wordMesh1.position.set(0, 1, 0);
        wordMesh2.position.set(5.5, 1, 0);
        wordMesh3.position.set(11, 1, 0);

        titleGroup.add(wordMesh1);
        titleGroup.add(wordMesh2);
        titleGroup.add(wordMesh3);

        titleGroup.rotation.set(0, Math.PI / 2, 0);
        titleGroup.scale.set(1.5, 1.5, 1);
        titleGroup.position.set(2.5, 18.8, 8);

        this.outdoorDisplay.add(titleGroup);
    }

    drawCreators() {
        const creatorsGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("CREATED");
        const wordMesh2 = this.buildWord("BY");
        const wordMesh3 = this.buildWord("BARBARA");
        const wordMesh4 = this.buildWord("&");
        const wordMesh5 = this.buildWord("LUIS");

        wordMesh1.position.set(0, 1, 0);
        wordMesh2.position.set(7.5, 1, 0);
        wordMesh3.position.set(10, 1, 0);
        wordMesh4.position.set(17.5, 1, 0);
        wordMesh5.position.set(19, 1, 0);

        creatorsGroup.add(wordMesh1);
        creatorsGroup.add(wordMesh2);
        creatorsGroup.add(wordMesh3);
        creatorsGroup.add(wordMesh4);
        creatorsGroup.add(wordMesh5);

        creatorsGroup.rotation.set(0, Math.PI / 2, 0);
        creatorsGroup.scale.set(0.7, 0.8, 1);
        creatorsGroup.position.set(2.5, 18, 8);

        this.outdoorDisplay.add(creatorsGroup);
    }

    drawYourName() {
        this.playerNameGroup = new THREE.Group();

        const yourNameGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("YOUR");
        const wordMesh2 = this.buildWord("NAME:");

        wordMesh1.position.set(0, 1, 0);
        wordMesh2.position.set(4.5, 1, 0);

        yourNameGroup.add(wordMesh1);
        yourNameGroup.add(wordMesh2);

        yourNameGroup.rotation.set(0, Math.PI / 2, 0);
        yourNameGroup.scale.set(0.7, 0.8, 1);
        yourNameGroup.position.set(2.5, 16, 12.5);

        this.playerNameGroup.rotation.set(0, Math.PI / 2, 0);
        this.playerNameGroup.scale.set(0.7, 0.8, 1);
        this.playerNameGroup.position.set(2.5, 16, 5.5);

        this.outdoorDisplay.add(yourNameGroup);
        this.outdoorDisplay.add(this.playerNameGroup);
    }

    drawPlayer1VehicleName(name) {
        this.player1VehicleNameGroup.clear();

        const wordMesh = this.buildWord(name);
        wordMesh.position.set(0, 1, 0);

        this.player1VehicleNameGroup.add(wordMesh);
    }

    drawPlayer1Vehicle() {
        const player1VehicleGroup = new THREE.Group();
        this.player1VehicleNameGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("PLAYER");
        const wordMesh2 = this.buildWord("1");
        const wordMesh3 = this.buildWord("VEHICLE:");

        wordMesh1.position.set(0, 1, 0);
        wordMesh2.position.set(6.5, 1, 0);
        wordMesh3.position.set(8, 1, 0);

        player1VehicleGroup.add(wordMesh1);
        player1VehicleGroup.add(wordMesh2);
        player1VehicleGroup.add(wordMesh3);

        player1VehicleGroup.rotation.set(0, Math.PI / 2, 0);
        player1VehicleGroup.scale.set(0.7, 0.8, 1);
        player1VehicleGroup.position.set(2.5, 14, 12.5);

        this.player1VehicleNameGroup.rotation.set(0, Math.PI / 2, 0);
        this.player1VehicleNameGroup.scale.set(0.7, 0.8, 1);
        this.player1VehicleNameGroup.position.set(2.5, 14, 0);

        this.outdoorDisplay.add(player1VehicleGroup);
        this.outdoorDisplay.add(this.player1VehicleNameGroup);
    }

    drawPlayer2VehicleName(name) {
        this.player2VehicleNameGroup.clear();

        const wordMesh = this.buildWord(name);
        wordMesh.position.set(0, 1, 0);

        this.player2VehicleNameGroup.add(wordMesh);
    }

    drawPlayer2Vehicle() {
        const player2VehicleGroup = new THREE.Group();
        this.player2VehicleNameGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("PLAYER");
        const wordMesh2 = this.buildWord("2");
        const wordMesh3 = this.buildWord("VEHICLE:");

        wordMesh1.position.set(0, 1, 0);
        wordMesh2.position.set(6.5, 1, 0);
        wordMesh3.position.set(8, 1, 0);

        player2VehicleGroup.add(wordMesh1);
        player2VehicleGroup.add(wordMesh2);
        player2VehicleGroup.add(wordMesh3);

        player2VehicleGroup.rotation.set(0, Math.PI / 2, 0);
        player2VehicleGroup.scale.set(0.7, 0.8, 1);
        player2VehicleGroup.position.set(2.5, 12, 12.5);

        this.player2VehicleNameGroup.rotation.set(0, Math.PI / 2, 0);
        this.player2VehicleNameGroup.scale.set(0.7, 0.8, 1);
        this.player2VehicleNameGroup.position.set(2.5, 12, 0);

        this.outdoorDisplay.add(player2VehicleGroup);
        this.outdoorDisplay.add(this.player2VehicleNameGroup);
    }

    drawNameButton() {
        const nameButtonGroup = new THREE.Group();

        const boxGeometry = new THREE.BoxGeometry();
        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });

        const buttonMesh = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh.scale.set(0.5, 2, 3.7);
        buttonMesh.position.set(0, 0, -1.2);
        nameButtonGroup.add(buttonMesh);

        const wordGroup = this.buildWord("NAME");
        wordGroup.scale.set(0.8, 1.2, 1);
        wordGroup.rotation.set(0, Math.PI / 2, 0);
        wordGroup.position.set(0.3, 0, 0);
        nameButtonGroup.add(wordGroup);

        nameButtonGroup.position.set(2.5, 10.3, 12.5);
        nameButtonGroup.name = 'name';
        this.enableLayers(nameButtonGroup, 5);

        this.outdoorDisplay.add(nameButtonGroup);
    }

    drawPlayer1Button() {
        const player1ButtonGroup = new THREE.Group();

        const boxGeometry = new THREE.BoxGeometry();
        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });

        const buttonMesh = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh.scale.set(0.5, 2, 7);
        buttonMesh.position.set(0, 0, -2.8);
        player1ButtonGroup.add(buttonMesh);

        const wordGroup = this.buildWord("PLAYER 1");
        wordGroup.scale.set(0.8, 1.2, 1);
        wordGroup.rotation.set(0, Math.PI / 2, 0);
        wordGroup.position.set(0.3, 0, 0);
        player1ButtonGroup.add(wordGroup);

        player1ButtonGroup.position.set(2.5, 10.3, 7.5);
        player1ButtonGroup.name = 'player1';
        this.enableLayers(player1ButtonGroup, 5);

        this.outdoorDisplay.add(player1ButtonGroup);
    }

    drawPlayer2Button() {
        const player2ButtonGroup = new THREE.Group();

        const boxGeometry = new THREE.BoxGeometry();
        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });

        const buttonMesh = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh.scale.set(0.5, 2, 7);
        buttonMesh.position.set(0, 0, -2.8);
        player2ButtonGroup.add(buttonMesh);

        const wordGroup = this.buildWord("PLAYER 2");
        wordGroup.scale.set(0.8, 1.2, 1);
        wordGroup.rotation.set(0, Math.PI / 2, 0);
        wordGroup.position.set(0.3, 0, 0);
        player2ButtonGroup.add(wordGroup);

        player2ButtonGroup.position.set(2.5, 10.3, -0.7);
        player2ButtonGroup.name = 'player2';
        this.enableLayers(player2ButtonGroup, 5);

        this.outdoorDisplay.add(player2ButtonGroup);
    }

    drawStartButton() {
        const startButtonGroup = new THREE.Group();

        const boxGeometry = new THREE.BoxGeometry();
        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });

        const buttonMesh = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh.scale.set(0.5, 2, 4.7);
        buttonMesh.position.set(0, 0, -1.6);
        startButtonGroup.add(buttonMesh);

        const wordGroup = this.buildWord("START");
        wordGroup.scale.set(0.8, 1.2, 1);
        wordGroup.rotation.set(0, Math.PI / 2, 0);
        wordGroup.position.set(0.3, 0, 0);
        startButtonGroup.add(wordGroup);

        startButtonGroup.position.set(2.5, 10.3, -9);
        startButtonGroup.name = 'start';
        this.enableLayers(startButtonGroup, 5);

        this.outdoorDisplay.add(startButtonGroup);
    }

    drawLevelButton() {
        const levelButtonGroup = new THREE.Group();

        const boxGeometry = new THREE.BoxGeometry();
        const materialCinza = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x808080) });

        const planeGeometry = new THREE.PlaneGeometry(6, 0.9);
        const materialBranco = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFFFFF) });
        const planeMesh = new THREE.Mesh(planeGeometry, materialBranco);
        planeMesh.position.set(0.3, 0, 0);
        planeMesh.rotation.set(0, Math.PI/2, 0);
        levelButtonGroup.add(planeMesh);

        const buttonMesh = new THREE.Mesh(boxGeometry, materialCinza);
        buttonMesh.scale.set(0.5, 1.3, 6.5);
        //buttonMesh.position.set(0, 0, -1.6);
        levelButtonGroup.add(buttonMesh);

        const wordExpertGroup = this.buildWord("EXPERT");
        wordExpertGroup.scale.set(0.5, 0.9, 1);
        wordExpertGroup.rotation.set(0, Math.PI/2, 0);
        wordExpertGroup.position.set(0.35, 0, 1.3);
        wordExpertGroup.name = 'expert';
        wordExpertGroup.visible = false;
        levelButtonGroup.add(wordExpertGroup);

        const wordIntermediateGroup = this.buildWord("INTERMEDIATE");
        wordIntermediateGroup.scale.set(0.5, 0.9, 1);
        wordIntermediateGroup.rotation.set(0, Math.PI/2, 0);
        wordIntermediateGroup.position.set(0.35, 0, 2.75);
        wordIntermediateGroup.name = 'intermediate';
        wordIntermediateGroup.visible = false;
        levelButtonGroup.add(wordIntermediateGroup);


        const wordBeginnerGroup = this.buildWord("BEGINNER");
        wordBeginnerGroup.scale.set(0.5, 0.9, 1);
        wordBeginnerGroup.rotation.set(0, Math.PI/2, 0);
        wordBeginnerGroup.position.set(0.35, 0, 1.8);
        wordBeginnerGroup.name = 'beginner';
        wordBeginnerGroup.visible = false;
        levelButtonGroup.add(wordBeginnerGroup);

        levelButtonGroup.position.set(2.2, 20.2, 12.5);
        levelButtonGroup.name = 'level';
        this.enableLayers(levelButtonGroup, 5);

        wordBeginnerGroup.visible = true;
    
        this.outdoorDisplay.add(levelButtonGroup);
    }

    drawLapsButton() {
        const lapsButtonGroup = new THREE.Group();

        const boxGeometry = new THREE.BoxGeometry();
        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x808080) });

        const buttonMesh = new THREE.Mesh(boxGeometry, materialVermelho);
        buttonMesh.scale.set(0.5, 1.3, 4.7);
        lapsButtonGroup.add(buttonMesh);

        const wordLaps3Group = this.buildWord("LAPS: 3");
        wordLaps3Group.scale.set(0.6, 0.9, 1);
        wordLaps3Group.rotation.set(0, Math.PI/2, 0);
        wordLaps3Group.position.set(0.3, 0, 1.85);
        wordLaps3Group.name = 'laps3';
        wordLaps3Group.visible = false;
        lapsButtonGroup.add(wordLaps3Group);

        const wordLaps4Group = this.buildWord("LAPS: 4");
        wordLaps4Group.scale.set(0.6, 0.9, 1);
        wordLaps4Group.rotation.set(0, Math.PI/2, 0);
        wordLaps4Group.position.set(0.3, 0, 1.85);
        wordLaps4Group.name = 'laps4';
        wordLaps4Group.visible = false;
        lapsButtonGroup.add(wordLaps4Group);

        const wordLaps5Group = this.buildWord("LAPS: 5");
        wordLaps5Group.scale.set(0.6, 0.9, 1);
        wordLaps5Group.rotation.set(0, Math.PI/2, 0);
        wordLaps5Group.position.set(0.3, 0, 1.85);
        wordLaps5Group.name = 'laps5';
        wordLaps5Group.visible = false;
        lapsButtonGroup.add(wordLaps5Group);

        lapsButtonGroup.position.set(2.2, 20.2, -13);
        lapsButtonGroup.name = 'laps';
        this.enableLayers(lapsButtonGroup, 5);

        wordLaps3Group.visible = true;

        this.outdoorDisplay.add(lapsButtonGroup);
    }

    drawPenaltyWarning() {
        const penaltyWarningGroup = new THREE.Group();

        const planeGeometry = new THREE.PlaneGeometry(14, 4);
        const materialVermelho = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });

        const warningMesh = new THREE.Mesh(planeGeometry, materialVermelho);
        warningMesh.position.set(6, -1, 0);
        penaltyWarningGroup.add(warningMesh);

        const textWarningGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("PENALTY");
        wordMesh1.position.set(3, 0, 0);
        const wordMesh2 = this.buildWord("APPLIED");
        wordMesh2.position.set(10.5, 0, 0);

        const wordMesh3 = this.buildWord("REMAINING");
        wordMesh3.position.set(0, -2, 0);
        const wordMesh4 = this.buildWord("TIME:");
        wordMesh4.position.set(9.5, -2, 0);

        const minsMesh = this.buildWord("00m");
        minsMesh.position.set(15, -2, 0);
        const secsMesh = this.buildWord("00s");
        secsMesh.position.set(18.5, -2, 0);

        textWarningGroup.add(wordMesh1);
        textWarningGroup.add(wordMesh2);
        textWarningGroup.add(wordMesh3);
        textWarningGroup.add(wordMesh4);
        textWarningGroup.add(minsMesh);
        textWarningGroup.add(secsMesh);

        textWarningGroup.scale.set(0.6, 1, 1);
        textWarningGroup.position.set(0, 0, 0.1);

        penaltyWarningGroup.add(textWarningGroup);
        penaltyWarningGroup.rotation.set(0, Math.PI / 2, 0);
        penaltyWarningGroup.position.set(2.5, 12, 6);
        this.app.scene.add(penaltyWarningGroup);
    }

    drawPowerUpWarning() {
        const powerUpWarningGroup = new THREE.Group();

        const planeGeometry = new THREE.PlaneGeometry(14, 4);
        const materialVerde = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00FF00) });

        const warningMesh = new THREE.Mesh(planeGeometry, materialVerde);
        warningMesh.position.set(6, -1, 0);
        powerUpWarningGroup.add(warningMesh);

        const textWarningGroup = new THREE.Group();

        const wordMesh1 = this.buildWord("POWER");
        wordMesh1.position.set(3, 0, 0);
        const wordMesh2 = this.buildWord("UP");
        wordMesh2.position.set(8.5, 0, 0);
        const wordMesh3 = this.buildWord("APPLIED");
        wordMesh3.position.set(11, 0, 0);

        const wordMesh4 = this.buildWord("REMAINING");
        wordMesh4.position.set(0, -2, 0);
        const wordMesh5 = this.buildWord("TIME:");
        wordMesh5.position.set(9.5, -2, 0);

        const minsMesh = this.buildWord("00m");
        minsMesh.position.set(15, -2, 0);
        const secsMesh = this.buildWord("00s");
        secsMesh.position.set(18.5, -2, 0);

        textWarningGroup.add(wordMesh1);
        textWarningGroup.add(wordMesh2);
        textWarningGroup.add(wordMesh3);
        textWarningGroup.add(wordMesh4);
        textWarningGroup.add(wordMesh5);
        textWarningGroup.add(minsMesh);
        textWarningGroup.add(secsMesh);

        textWarningGroup.scale.set(0.6, 1, 1);
        textWarningGroup.position.set(0, 0, 0.1);

        powerUpWarningGroup.add(textWarningGroup);
        powerUpWarningGroup.rotation.set(0, Math.PI / 2, 0);
        powerUpWarningGroup.position.set(2.5, 12, 6);
        this.app.scene.add(powerUpWarningGroup);
    }

    buildWord(texto) {
        const word = new THREE.Group();

        const charWidth = 1;  // Largura do caractere na cena
        for (let i = 0; i < texto.length; i++) {
            let mesh = this.buildLetter(texto[i]);
            mesh.position.set(i * charWidth, 0, 0);

            word.add(mesh);
        }

        return word;
    }

    buildLetter(char) {
        const spritesheetCols = 10;
        const spritesheetRows = 10;

        const charCode = char.charCodeAt(0);
        const { u, v } = this.getUV(charCode, spritesheetCols, spritesheetRows);

        const corBrancaMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const geometry = new THREE.PlaneGeometry(1, 1);

        let charMesh = new THREE.Mesh(geometry, corBrancaMaterial);

        const texture = new THREE.TextureLoader();
        texture.load('layer-track/textures/sprite2.png', function (textura) {
            charMesh.material = new THREE.MeshBasicMaterial({ map: textura });
            charMesh.material.map.offset.set(u, v);
            charMesh.material.map.repeat.set(0.07, 0.06);
        });

        return charMesh;
    }

    getUV(charCode, spritesheetCols, spritesheetRows) {
        let col = charCode % spritesheetCols - 2;
        let row = Math.ceil(charCode / spritesheetCols - 3);

        if (col < 0) {
            col += 10;
        }

        if (col === 9) {
            row -= 1;
        }

        const u = col / spritesheetCols + 0.016;
        const v = 1 - (row / spritesheetRows) + 0.023; // Inverter para coordenadas de textura do ThreeJS

        return { u, v };
    }

    addPlatform(node) {
        this.platform.visible = true;
        this.platform.position.set(node.position.x, 1, node.position.z);
        node.position.y += 2.2;
    }

    removePlatform(node) {
        node.position.y -= 2.2;
    }

    drawPark() {
        const platformGeometry = new THREE.BoxGeometry();
        const platformTexture = new THREE.TextureLoader().load('layer-track/textures/platform.jpg');
        const platformMaterial = new THREE.MeshBasicMaterial({ map: platformTexture, color: "#a0a0a0" });

        this.platform = new THREE.Mesh(platformGeometry, platformMaterial);
        this.platform.scale.set(10, 2, 5);
        this.platform.visible = false;

        this.app.scene.add(this.platform);

        let posList = [[10, 1, -25], [10, 1, -40], [10, 1, -55], [25, 1, -25], [25, 1, -40], [25, 1, -55]];

        // Adicionar à cena todos os carros que vão poder ser selecionados
        let count = 0;
        for (var name in this.vehiclesReader.objs) {
            const vehicle = this.vehiclesReader.objs[name];

            // Mudar para a posição que queremos
            vehicle.node.position.set(posList[count][0], vehicle.height, posList[count][2]);
            vehicle.node.scale.set(5, 5, 5);
            vehicle.node.rotation.set(0, -Math.PI / 2, 0);
            this.enableLayers(vehicle.node, 5);
            this.app.scene.add(vehicle.node);
            count++;
        }
    }

    exitPark() {
        for (var name in this.vehiclesReader.objs) {
            const vehicle = this.vehiclesReader.objs[name];
            vehicle.node.scale.set(1, 1, 1);
            this.app.scene.remove(vehicle.node);
        }

        this.app.scene.remove(this.platform);
    }

    drawObstaclePark() {
        // Remover todos os obstáculos da pista
        this.obstaclesReader.removeObstaclesFromScene();

        let posList = [[0, 1, 0], [2, 1, 2], [0, 1, 2], [2, 1, 0]];

        // Adicionar à cena todos os obstáculos que vão poder ser selecionados
        let count = 0;
        for (var name in this.obstaclesReader.objs) {
            const obstacle = this.obstaclesReader.objs[name];

            // Mudar para a posição que queremos
            obstacle.node.position.set(posList[count][0], posList[count][1], posList[count][2]);

            this.obstaclesReader.addObstacleToScene(obstacle, false);
            this.enableLayers(obstacle.node, 3);
            count++;
        }
    }

    exitObstaclePark() {
        // Remover todos os obstáculos da pista
        this.obstaclesReader.removeObstaclesFromScene();
    }

    drawObstaclesLayer() {
        // Adicionar os obstáculos da pista à cena
        for (var name in this.obstaclesReader.tracksObstacles) {
            const obstacle = this.obstaclesReader.tracksObstacles[name];

            // Dar set novamente para as posições originais na pista
            obstacle.node.position.set(obstacle.xPos, obstacle.yPos, obstacle.zPos);

            this.obstaclesReader.addObstacleToScene(obstacle, true);
        }
    }

    drawPositionsLayer() {
        this.selectablePositions = [];

        // Desenhar posições disponíveis
        for (var position of this.route.availablePositions) {
            const selectablePosition = this.route.convertToSelectablePosition(position);
            this.selectablePositions.push(selectablePosition);
        }
    }

    exitPositionsLayer() {
        // Remover todas as posições selecionáveis
        for (var positionMesh of this.selectablePositions) {
            this.app.scene.remove(positionMesh);
        }
    }

    enableLayers(object, layer) {
        if (object instanceof THREE.Mesh) {
            // Atribuir a layer ao Mesh
            object.layers.enable(layer);
            return;
        }

        // Recursivamente, chamar a função para todos os filhos
        if (object.children && object.children.length > 0) {
            for (var child of object.children) {
                this.enableLayers(child, layer);
            }
        }
    }

    updateScene() {
        let layer_vehicles_visibility = this.visibleLayers.includes('vehicles');
        let layer_powerUps_visibility = this.visibleLayers.includes('power-ups');
        let layer_track_visibility = this.visibleLayers.includes('track');

        if (this.manualCar) {
            this.manualCar.node.visible = layer_vehicles_visibility;
        }

        if (this.autonomousCar) {
            this.autonomousCar.node.visible = layer_vehicles_visibility;
        }

        for (let name in this.powerUpsReader.objs) {
            this.powerUpsReader.objs[name].node.visible = layer_powerUps_visibility;
        }

        this.track.curve.visible = layer_track_visibility;
        this.track.finishLine.visible = layer_track_visibility;
    }

    setVisibleLayers(layers) {
        this.visibleLayers.length = 0;

        layers.forEach(layer => {
            this.visibleLayers.push(layer);
        });
    }
}

export { MyReader };