let leaderboardData = []; // For keeping data
let sortDirection = {}; // Sort direction

// Loading data.json
async function loadLeaderboardData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load leaderboard data');
        }
        const data = await response.json();
        leaderboardData = data.leaderboard;
        addColorIndicators(leaderboardData);
        calculateRanks(leaderboardData);
        calculateOverallStats(leaderboardData);
        displayLeaderboard(leaderboardData);
        addSortListeners();
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
    }
}

function displayLeaderboard(data) {
    const tableBody = document.querySelector('#leaderboardTable tbody');
    tableBody.innerHTML = '';

    data.forEach(player => {
        const row = document.createElement('tr');

        let rankClass = '';
        let nameClass = '';
        if (player.rank === 1) {
            rankClass = 'gold';
            nameClass = 'gold-name';
        } else if (player.rank === 2) {
            rankClass = 'silver';
            nameClass = 'silver-name';
        } else if (player.rank === 3) {
            rankClass = 'bronze';
            nameClass = 'bronze-name';
        }

        row.innerHTML = `
            <td class="rank ${rankClass}">${player.rank} ${player.medal}</td>
            <td class="player-name ${nameClass}">${player.name}</td>
            <td>${player.lastPlayed || 'N/A'}</td>
            <td>${player.pmcLevel}</td>
            <td>${player.totalRaids}</td>
            <td class="${player.survivedToDiedRatioClass}">${player.survivedToDiedRatio}%</td>
            <td class="${player.killToDeathRatioClass}">${player.killToDeathRatio}</td>
            <td class="${player.averageLifeTimeClass}">${player.averageLifeTime}</td>
        `;

        tableBody.appendChild(row);
    });
}

function addSortListeners() {
    const headers = document.querySelectorAll('#leaderboardTable th[data-sort]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            sortLeaderboard(sortKey);
        });
    });
}

function sortLeaderboard(sortKey) {
    if (!sortDirection[sortKey]) {
        sortDirection[sortKey] = 'asc';
    } else {
        sortDirection[sortKey] = sortDirection[sortKey] === 'asc' ? 'desc' : 'asc';
    }

    leaderboardData.sort((a, b) => {
        let valueA = a[sortKey];
        let valueB = b[sortKey];

        if (sortKey === 'rank') {
            valueA = a.rank;
            valueB = b.rank;
        }

        if (sortKey === 'pmcLevel' || sortKey === 'totalRaids' || sortKey === 'survivedToDiedRatio' || sortKey === 'killToDeathRatio') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }

        if (sortKey === 'averageLifeTime') {
            valueA = convertTimeToSeconds(valueA);
            valueB = convertTimeToSeconds(valueB);
        }

        if (valueA < valueB) {
            return sortDirection[sortKey] === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortDirection[sortKey] === 'asc' ? 1 : -1;
        }
        return 0;
    });

    displayLeaderboard(leaderboardData);
}

function convertTimeToSeconds(time) {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
}

function addColorIndicators(data) {
    data.forEach(player => {
        // Survived/Died Ratio
        if (player.survivedToDiedRatio < 40) {
            player.survivedToDiedRatioClass = 'bad';
        } else if (player.survivedToDiedRatio >= 30 && player.survivedToDiedRatio < 60) {
            player.survivedToDiedRatioClass = 'average';
        } else {
            player.survivedToDiedRatioClass = 'good';
        }

        // Kill/Death Ratio
        if (player.killToDeathRatio < 5) {
            player.killToDeathRatioClass = 'bad';
        } else if (player.killToDeathRatio >= 8 && player.killToDeathRatio < 12) {
            player.killToDeathRatioClass = 'average';
        } else {
            player.killToDeathRatioClass = 'good';
        }

        // Average Life Time
        const lifeTimeSeconds = convertTimeToSeconds(player.averageLifeTime);
        if (lifeTimeSeconds < 300) { // Less than 5 minutes
            player.averageLifeTimeClass = 'bad';
        } else if (lifeTimeSeconds >= 300 && lifeTimeSeconds < 900) {
            player.averageLifeTimeClass = 'average';
        } else {
            player.averageLifeTimeClass = 'good';
        }
    });
}

// Ranks
function calculateRanks(data) {
    // Sorting by Kill/Death Ratio
    data.sort((a, b) => b.killToDeathRatio - a.killToDeathRatio);

    // Adding ranks and medals
    data.forEach((player, index) => {
        player.rank = index + 1;
        if (player.rank === 1) {
            player.medal = '🥇'; // Золотая медаль
        } else if (player.rank === 2) {
            player.medal = '🥈'; // Серебряная медаль
        } else if (player.rank === 3) {
            player.medal = '🥉'; // Бронзовая медаль
        } else {
            player.medal = ''; // Без медали
        }
    });
}

// Overall stats calc
function calculateOverallStats(data) {
    let totalDeaths = 0;
    let totalRaids = 0;
    let totalKills = 0;
    let totalKDR = 0;
    let totalSurvival = 0;

    data.forEach(player => {
        totalDeaths += Math.round(player.totalRaids * (100 - player.survivedToDiedRatio) / 100);
        totalRaids += parseInt(player.totalRaids);
        totalKills += parseFloat(player.killToDeathRatio) * Math.round(player.totalRaids * (100 - player.survivedToDiedRatio) / 100);
        totalKDR += parseFloat(player.killToDeathRatio);
        totalSurvival += parseFloat(player.survivedToDiedRatio);
    });

    const averageKDR = (totalKDR / data.length).toFixed(2);
    const averageSurvival = (totalSurvival / data.length).toFixed(2);

    // Обновляем блок статистики
    document.getElementById('totalDeaths').textContent = totalDeaths;
    document.getElementById('totalRaids').textContent = totalRaids;
    document.getElementById('totalKills').textContent = Math.round(totalKills);
    document.getElementById('averageKDR').textContent = averageKDR;
    document.getElementById('averageSurvival').textContent = `${averageSurvival}%`;
}

// Loading all data
document.addEventListener('DOMContentLoaded', loadLeaderboardData);