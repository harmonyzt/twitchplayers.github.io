let leaderboardData = []; // For keeping data
let sortDirection = {}; // Sort direction

// Loading data.json
async function loadLeaderboardData() {
    try {
        const response = await fetch('/leaderboard/js/data.json');
        if (!response.ok) {
            throw new Error('Failed to load leaderboard data');
        }
        const data = await response.json();
        leaderboardData = data.leaderboard;
        displayLeaderboard(leaderboardData);
        addSortListeners();
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
    }
}

// Displaying data
function displayLeaderboard(data) {
    const tableBody = document.querySelector('#leaderboardTable tbody');
    tableBody.innerHTML = '';

    data.forEach(player => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.lastPlayed || 'N/A'}</td>
            <td>${player.pmcLevel}</td>
            <td>${player.totalRaids}</td>
            <td>${player.survivedToDiedRatio}%</td>
            <td>${player.killToDeathRatio}</td>
            <td>${player.averageLifeTime}</td>
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

// Loading all data
document.addEventListener('DOMContentLoaded', loadLeaderboardData);