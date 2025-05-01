// Elementos DOM
const rankingList = document.getElementById('ranking-list');
const refreshBtn = document.getElementById('refresh-btn');
const backBtn = document.getElementById('back-btn');

// Carrega o ranking
function loadRanking() {
    rankingList.innerHTML = '<div class="loading">Carregando ranking...</div>';
    
    database.ref('games').orderByChild('score').limitToLast(20).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                rankingList.innerHTML = '<div class="empty">Nenhum dado encontrado</div>';
                return;
            }
            
            const players = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                players.push({
                    name: data.playerName || 'Anônimo',
                    course: data.courseName || 'Não informado',
                    score: data.score || 0
                });
            });
            
            // Ordena por pontuação (maior para menor)
            players.sort((a, b) => b.score - a.score);
            
            // Exibe apenas os top 20
            displayRanking(players.slice(0, 20));
        })
        .catch(error => {
            console.error("Erro:", error);
            rankingList.innerHTML = `<div class="error">Erro ao carregar</div>`;
        });
}

// Exibe o ranking na tela
function displayRanking(players) {
    rankingList.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player';
        playerElement.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="name">${player.name}</span>
            <span class="points">${player.score}</span>
            <span class="course">${player.course}</span>
        `;
        rankingList.appendChild(playerElement);
    });
}

// Event Listeners
refreshBtn.addEventListener('click', loadRanking);
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Inicia o carregamento
loadRanking();