<script>
  import { onMount } from 'svelte';
  import { leagueID } from '$lib/utils/leagueInfo';

  let rankings = [];
  let loading = true;
  let errorMsg = "";

  onMount(async () => {
    try {
      // 1. Fetch League Users, Rosters, and Current State
      const [usersRes, rostersRes, stateRes, leagueRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/users`),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`),
        fetch(`https://api.sleeper.app/v1/state/nfl`),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}`)
      ]);

      const users = await usersRes.json();
      const rosters = await rostersRes.json();
      const state = await stateRes.json();
      const league = await leagueRes.json();

      const userMap = {};
      users.forEach(u => {
        userMap[u.user_id] = u.metadata?.team_name || u.display_name;
      });

      // 2. Fetch NFL Player Projections for the upcoming/current week
      const currentWeek = state.week || 1;
      const projRes = await fetch(`https://api.sleeper.app/v1/projections/nfl/regular/${state.season}/${currentWeek}`);
      const projections = await projRes.json();

      // Helper map for quick projection lookup
      const projMap = {};
      if (Array.isArray(projections)) {
        projections.forEach(p => {
          projMap[p.player_id] = p.stats?.pts_half_ppr || p.stats?.pts_ppr || p.stats?.pts_std || 0;
        });
      }

      // 3. Process Rosters & Positional Scores
      const teamScores = rosters.map(r => {
        const teamName = userMap[r.owner_id] || `Team ${r.roster_id}`;
        const starters = r.starters || [];
        const players = r.players || [];

        let totalStarterProj = 0;
        let posBreakdown = { QB: 0, RB: 0, WR: 0, TE: 0, FLEX: 0 };

        // Calculate Starter PPG
        starters.forEach((pid, idx) => {
          const proj = projMap[pid] || 0;
          totalStarterProj += proj;

          // Map positions based on Sleeper roster positions format
          const pos = league.roster_positions ? league.roster_positions[idx] : 'FLEX';
          if (posBreakdown[pos] !== undefined) {
            posBreakdown[pos] += proj;
          } else {
            posBreakdown.FLEX += proj;
          }
        });

        // Calculate Bench Depth Value
        const bench = players.filter(p => !starters.includes(p));
        let benchProj = 0;
        bench.forEach(pid => {
          benchProj += (projMap[pid] || 0);
        });

        // Total Projected Score: Starter Projections + 10% Bench Depth Weight
        const compositeProj = totalStarterProj + (benchProj * 0.10);

        return {
          roster_id: r.roster_id,
          name: teamName,
          starterProj: totalStarterProj.toFixed(1),
          benchProj: benchProj.toFixed(1),
          posBreakdown,
          compositeProj
        };
      });

      // 4. Scale Scores to a 0 - 100 Rating
      const maxProj = Math.max(...teamScores.map(t => t.compositeProj)) || 1;
      const minProj = Math.min(...teamScores.map(t => t.compositeProj)) || 0;

      rankings = teamScores.map(t => {
        const powerScore = maxProj === minProj 
          ? 50 
          : (((t.compositeProj - minProj) / (maxProj - minProj)) * 40 + 60).toFixed(1);

        return {
          ...t,
          powerScore
        };
      }).sort((a, b) => b.powerScore - a.powerScore);

      loading = false;
    } catch (err) {
      console.error("Error calculating projected power rankings:", err);
      errorMsg = "Unable to load projected rankings.";
      loading = false;
    }
  });
</script>

{#if loading}
  <p class="loading">Analyzing projected team strengths...</p>
{:else if errorMsg}
  <p class="error">{errorMsg}</p>
{:else}
  <div class="rankings-container">
    <h3>Projected Team Strengths</h3>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Power Index</th>
          <th>Projected Starter PPG</th>
          <th>Bench Depth</th>
          <th>QB Proj</th>
          <th>RB Proj</th>
          <th>WR Proj</th>
          <th>TE Proj</th>
        </tr>
      </thead>
      <tbody>
        {#each rankings as team, i}
          <tr>
            <td class="rank">#{i + 1}</td>
            <td class="team-name">{team.name}</td>
            <td class="score">{team.powerScore}</td>
            <td class="ppg">{team.starterProj} pts</td>
            <td>{team.benchProj} pts</td>
            <td>{team.posBreakdown.QB.toFixed(1)}</td>
            <td>{team.posBreakdown.RB.toFixed(1)}</td>
            <td>{team.posBreakdown.WR.toFixed(1)}</td>
            <td>{team.posBreakdown.TE.toFixed(1)}</td>
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
    font-size: 0.95rem;
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
    color: #f39c12;
  }
  .ppg {
    font-weight: bold;
  }
  .loading, .error {
    font-style: italic;
    color: #888;
  }
</style>
