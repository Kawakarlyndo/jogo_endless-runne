// Configurações do jogo
const config = {
    player: {
        jumpHeight: 25,
        jumpDuration: 800,
        startBottom: 25
    },
    game: {
        baseSpeed: 0.05,
        speedIncrease: 0.00001,
        minObstacleInterval: 1500,
        maxObstacleInterval: 2500
    },
    colors: {
        player: "",
        obstacles: ['./img/lamen.gif']
    }
};

// Estado do jogo
let gameState = {
    score: 0,
    isRunning: false,
    isJumping: false,
    jumpStartTime: 0,
    gameSpeed: config.game.baseSpeed,
    lastObstacleTime: 0,
    obstacles: [],
    animationId: null,
    playerBottom: config.player.startBottom,
    lastFrameTime: 0,
    playerName: '',
    courseName: '',
    gameStartTime: 0
};

// Elementos DOM
const player = document.getElementById('player');
const obstaclesContainer = document.getElementById('obstacles');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const registerScreen = document.getElementById('register-screen');
const registerBtn = document.getElementById('register-btn');
const closeRegisterBtn = document.getElementById('close-register');
const playerNameInput = document.getElementById('player-name');
const courseNameInput = document.getElementById('course-name');

// Função para salvar os dados no Firebase
function saveGameData() {
    const gameData = {
        playerName: gameState.playerName || 'Anônimo',
        courseName: gameState.courseName || 'Não informado',
        score: gameState.score,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        playTime: Math.round((performance.now() - gameState.gameStartTime) / 1000)
    };

    database.ref('games').push(gameData)
        .then(() => console.log('Dados salvos com sucesso'))
        .catch(error => console.error('Erro ao salvar dados:', error));
}

// Mostrar tela de registro
function showRegisterScreen() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    registerScreen.style.display = 'flex';
}

// Registrar informações do jogador
function registerPlayer() {
    if (playerNameInput.value.trim() === '' || courseNameInput.value.trim() === '') {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    gameState.playerName = playerNameInput.value.trim();
    gameState.courseName = courseNameInput.value.trim();
    gameState.gameStartTime = performance.now();
    
    startGame();
}

// Inicializar jogo
function initGame() {
    gameState = {
        ...gameState,
        score: 0,
        isRunning: true,
        isJumping: false,
        jumpStartTime: 0,
        gameSpeed: config.game.baseSpeed,
        lastObstacleTime: 0,
        obstacles: [],
        animationId: null,
        playerBottom: config.player.startBottom,
        lastFrameTime: performance.now(),
        gameStartTime: performance.now()
    };
    
    scoreElement.textContent = '0';
    obstaclesContainer.innerHTML = '';
    updatePlayerPosition();
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'none';
    registerScreen.style.display = 'none';
}

// Atualizar posição do jogador
function updatePlayerPosition() {
    player.style.bottom = `${gameState.playerBottom}vh`;
}

// Loop principal do jogo
function gameLoop(currentTime) {
    if (!gameState.isRunning) return;
    
    gameState.animationId = requestAnimationFrame(gameLoop);
    
    const deltaTime = currentTime - gameState.lastFrameTime;
    gameState.lastFrameTime = currentTime;
    
    if (gameState.isJumping) {
        const jumpProgress = (currentTime - gameState.jumpStartTime) / config.player.jumpDuration;
        
        if (jumpProgress < 1) {
            const jumpHeight = config.player.jumpHeight * (1 - Math.pow(jumpProgress - 1, 2));
            gameState.playerBottom = config.player.startBottom + jumpHeight;
        } else {
            gameState.isJumping = false;
            gameState.playerBottom = config.player.startBottom;
        }
        
        updatePlayerPosition();
    }
    
    if (currentTime - gameState.lastObstacleTime > getObstacleInterval()) {
        createObstacle();
        gameState.lastObstacleTime = currentTime;
    }
    
    moveObstacles(deltaTime);
    
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    gameState.gameSpeed = config.game.baseSpeed + (gameState.score * config.game.speedIncrease);
    gameState.score += 1;
    scoreElement.textContent = Math.floor(gameState.score);
}

function getObstacleInterval() {
    return Math.max(
        config.game.minObstacleInterval,
        config.game.maxObstacleInterval - (gameState.score * 0.05)
    );
}

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    const imgIndex = Math.floor(Math.random() * config.colors.obstacles.length);
    obstacle.style.backgroundImage = `url('${config.colors.obstacles[imgIndex]}')`;
    obstaclesContainer.appendChild(obstacle);
    
    gameState.obstacles.push({
        element: obstacle,
        x: 100,
        width: 12
    });
}

function moveObstacles(deltaTime) {
    const speed = gameState.gameSpeed * deltaTime;
    
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.x -= speed;
        obstacle.element.style.right = `${100 - obstacle.x}vw`;
        
        if (obstacle.x < -obstacle.width) {
            obstaclesContainer.removeChild(obstacle.element);
            gameState.obstacles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    const playerRect = player.getBoundingClientRect();
    
    for (const obstacle of gameState.obstacles) {
        const obstacleRect = obstacle.element.getBoundingClientRect();
        
        if (
            playerRect.right > obstacleRect.left + 10 &&
            playerRect.left + 10 < obstacleRect.right &&
            playerRect.bottom > obstacleRect.top + 10 &&
            playerRect.top + 10 < obstacleRect.bottom
        ) {
            return true;
        }
    }
    return false;
}

function startJump() {
    if (!gameState.isRunning) return;
    
    if (!gameState.isJumping) {
        gameState.isJumping = true;
        gameState.jumpStartTime = performance.now();
    }
}

function startGame() {
    initGame();
    gameState.lastFrameTime = performance.now();
    gameLoop(performance.now());
}

function gameOver() {
    gameState.isRunning = false;
    cancelAnimationFrame(gameState.animationId);
    saveGameData();
    gameOverScreen.style.display = 'flex';
}

// Event listeners
document.addEventListener('touchstart', function(e) {
    if (gameState.isRunning) {
        e.preventDefault();
        startJump();
    }
}, { passive: false });

document.addEventListener('mousedown', function(e) {
    if (gameState.isRunning) {
        e.preventDefault();
        startJump();
    }
});

registerBtn.addEventListener('click', registerPlayer);
closeRegisterBtn.addEventListener('click', startGame);
startScreen.addEventListener('click', showRegisterScreen);
gameOverScreen.addEventListener('click', showRegisterScreen);

document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

document.getElementById('ranking-btn').addEventListener('click', () => {
    window.location.href = 'ranking.html';
});

// Inicialização
startScreen.style.display = 'flex';
gameOverScreen.style.display = 'none';
registerScreen.style.display = 'none';