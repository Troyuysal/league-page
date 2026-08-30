<script>
  import { onMount } from 'svelte';
  import { leagueID } from '$lib/utils/leagueInfo';

  let rankings = [];
  let loading = true;

  onMount(async () => {
    try {
      // 1. Fetch Users, Rosters, and League State
      const [usersRes, rostersRes, stateRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/users`),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`),
        fetch(`https://api.sleeper.app/v1/state/nfl`)
      ]);

      const users = await usersRes.json();
      const rosters = await rostersRes.json();
      const state = await stateRes.json();

      const userMap = {};
      users.forEach(u => {
        userMap[u.user_id] = u.metadata?.team_name || u.display_name;
      });

      const currentWeek = state.display_week > 1 ? state.display_week - 1 : 1;

      // 2. Initialize Teams
      const teams = {};
      rosters.forEach(r => {
        teams[r.roster_id] = {
          roster_id: r.roster_id,
          name: userMap[r.owner_id] || `Team ${r.roster_id}`,
          wins: r.settings.wins || 0,
          losses: r.settings.losses || 0,
          fpts: (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100),
          allPlayWins: 0,
          allPlayLosses: 0
        };
      });

      // 3. Fetch Matchups up to Current Week for All-Play Record
      const matchupPromises = [];
      for (let w = 1; w <= currentWeek; w++) {
        matchupPromises.push(fetch(`https://api.sleeper.app/v1/league/${leagueID}/matchups/${w}`).then(r => r.json()));
      }
      const weeklyMatchups = await Promise.all(matchupPromises);

      weeklyMatchups.forEach(week => {
        if (!week || !week.length) return;
        week.forEach(teamA => {
          if (!teams[teamA.roster_id]) return;
          week.forEach(teamB => {
            if (teamA.roster_id === teamB.roster_id) return;
            if (teamA.points > teamB.points) teams[teamA.roster_id].allPlayWins++;
            else if (teamA.points < teamB.points) teams[teamA.roster_id].allPlayLosses++;
          });
        });
      });

      // 4. Calculate Scores & Normalize
      const teamList = Object.values(teams);
      const maxFpts = Math.max(...teamList.map(t => t.fpts)) || 1;
      const minFpts = Math.min(...teamList.map(t => t.fpts)) || 0;

      rankings = teamList.map(t => {
        const winPct = (t.wins + t.losses) > 0 ? t.wins / (t.wins + t.losses) : 0.5;
        const allPlayPct = (t.allPlayWins + t.allPlayLosses) > 0 ? t.allPlayWins / (t.allPlayWins + t.allPlayLosses) : 0.5;
        const normFpts = maxFpts === minFpts ? 0.5 : (t.fpts - minFpts) / (maxFpts - minFpts);

        // Score Formula: 40% Wins, 40% Points For, 20% All-Play
        const score = ((winPct * 0.40) + (normFpts * 0.40) + (allPlayPct * 0.20)) * 100;

        return { ...t, score: score.toFixed(1) };
      }).sort((a, b) => b.score - a.score);

      loading = false;
    } catch (err) {
      console.error("Error loading power rankings:", err);
      loading = false;
    }
  });
</script>

{#if loading}
  <p class="loading">Calculating Power Rankings...</p>
{:else}
  <div class="rankings-container">
    <h3>League Power Rankings</h3>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Power Score</th>
          <th>Record</th>
          <th>Points For</th>
          <th>All-Play</th>
        </tr>
      </thead>
      <tbody>
        {#each rankings as team, i}
          <tr>
            <td class="rank">#{i + 1}</td>
            <td class="team-name">{team.name}</td>
            <td class="score">{team.score}</td>
            <td>{team.wins}-{team.losses}</td>
            <td>{team.fpts.toFixed(1)}</td>
            <td>{team.allPlayWins}-{team.allPlayLosses}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .rankings-container {
    margin: 20px 0;
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  th, td {
    padding: 10px;
    border-bottom: 1px solid #333;
  }
  .rank {
    font-weight: bold;
    color: #00ceb8;
  }
  .score {
    font-weight: bold;
  }
  .loading {
    font-style: italic;
    color: #888;
  }
</style>
