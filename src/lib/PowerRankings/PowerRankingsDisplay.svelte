<script>
  import { onMount } from 'svelte';
  import { leagueID } from '$lib/utils/leagueInfo';

  let rankings = [];
  let loading = true;
  let statusMessage = "Loading player database & projections...";

  onMount(async () => {
    try {
      // 1. Fetch Users, Rosters, State, and League Configuration
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

      // 2. Fetch Master NFL Players Dataset (Positions)
      statusMessage = "Mapping positions & projections...";
      let playersData = {};
      try {
        const playersRes = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (playersRes.ok) {
          playersData = await playersRes.json();
        }
      } catch (e) {
        console.warn("Could not fetch master player list.", e);
      }

      // 3. Fetch Projections for current season / week
      const season = state.season || '2026';
      const week = state.week || 1;
      let projMap = {};
      let projectionsFound = false;

      try {
        const projRes = await fetch(`https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`);
        if (projRes.ok) {
          const projections = await projRes.json();
          if (Array.isArray(projections) && projections.length > 0) {
            projections.forEach(p => {
              const pts = p.stats?.pts_half_ppr || p.stats?.pts_ppr || p.stats?.pts_std || 0;
              if (pts > 0) projectionsFound = true;
              projMap[p.player_id] = pts;
            });
          }
        }
      } catch (e) {
        console.warn("Weekly projections unavailable.", e);
      }

      // 4. Calculate Scores for Each Team
      const teamScores = rosters.map(r => {
        const teamName = userMap[r.owner_id] || `Team ${r.roster_id}`;
        const starters = r.starters || [];
        const players = r.players || [];

        let starterProjTotal = 0;
        let posBreakdown = { QB: 0, RB: 0, WR: 0, TE: 0 };

        // Process Starting Lineup
        starters.forEach(pid => {
          const playerObj = playersData[pid] || {};
          const pos = playerObj.position || 'FLEX';
          const proj = projMap[pid] || 0;

          starterProjTotal += proj;

          if (posBreakdown[pos] !== undefined) {
            posBreakdown[pos] += proj;
          }
        });

        // Bench points calculation
        const bench = players.filter(p => !starters.includes(p));
        let benchProjTotal = 0;
        bench.forEach(pid => {
          benchProjTotal += (projMap[pid] || 0);
        });

        // Historical Fallback if projections are empty
        const totalFpts = (r.settings?.fpts || 0) + ((r.settings?.fpts_decimal || 0) / 100);
        const wins = r.settings?.wins || 0;
        const losses = r.settings?.losses || 0;
        const gamesPlayed = (wins + losses) || 1;
        const historicalPPG = totalFpts / gamesPlayed;

        // Use projections if live, otherwise use Roster Count/Historical
        const displayStarterPPG = projectionsFound ? starterProjTotal : historicalPPG;
        const displayBenchPPG = projectionsFound ? benchProjTotal : (bench.length * 2.5);

        return {
          roster_id: r.roster_id,
          name: teamName,
          displayStarterPPG,
          displayBenchPPG,
          posBreakdown,
          projectionsFound,
          rawScore: displayStarterPPG + (displayBenchPPG * 0.10)
        };
      });

      // 5. Min-Max Normalization to Scale Scores from 60 to 100
      const scores = teamScores.map(t => t.rawScore);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      rankings = teamScores.map(t => {
        let powerIndex = 50;
        if (maxScore !== minScore) {
          powerIndex = (((t.rawScore - minScore) / (maxScore - minScore)) * 40 + 60);
        }

        return {
          ...t,
          powerIndex: powerIndex.toFixed(1)
        };
      }).sort((a, b) => b.rawScore - a.rawScore);

      loading = false;
    } catch (err) {
      console.error("Error generating power rankings:", err);
      statusMessage = "Error building team strength rankings.";
      loading = false;
    }
  });
</script>

{#if loading}
  <p class="loading">{statusMessage}</p>
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
            <td class="score">{team.powerIndex}</td>
            <td class="ppg">{team.displayStarterPPG.toFixed(1)} pts</td>
            <td>{team.displayBenchPPG.toFixed(1)} pts</td>
            <td>{team.projectionsFound && team.posBreakdown.QB > 0 ? team.posBreakdown.QB.toFixed(1) : '-'}</td>
            <td>{team.projectionsFound && team.posBreakdown.RB > 0 ? team.posBreakdown.RB.toFixed(1) : '-'}</td>
            <td>{team.projectionsFound && team.posBreakdown.WR > 0 ? team.posBreakdown.WR.toFixed(1) : '-'}</td>
            <td>{team.projectionsFound && team.posBreakdown.TE > 0 ? team.posBreakdown.TE.toFixed(1) : '-'}</td>
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
  .loading {
    font-style: italic;
    color: #888;
  }
</style>
