<script>
  import { onMount } from 'svelte';
  import { leagueID } from '$lib/utils/leagueInfo';

  let rankings = [];
  let loading = true;
  let errorMsg = "";

  onMount(async () => {
    try {
      // 1. Fetch Users, Rosters, State, and League Settings
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

      // 2. Fetch Player Data (Positions) & Projections
      // Note: We use previous season data as baseline PPG if current week projections are empty
      const season = state.season || '2025';
      const week = state.week || 1;

      // Fetch weekly projections safely
      let projMap = {};
      try {
        const projRes = await fetch(`https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`);
        if (projRes.ok) {
          const projections = await projRes.json();
          if (Array.isArray(projections)) {
            projections.forEach(p => {
              projMap[p.player_id] = p.stats?.pts_half_ppr || p.stats?.pts_ppr || p.stats?.pts_std || 0;
            });
          }
        }
      } catch (e) {
        console.warn("Could not fetch weekly projections, defaulting to roster historical averages.", e);
      }

      // 3. Process Teams
      const teamScores = rosters.map(r => {
        const teamName = userMap[r.owner_id] || `Team ${r.roster_id}`;
        const starters = r.starters || [];
        const players = r.players || [];
        const rosterPositions = league.roster_positions || ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'FLEX'];

        // Fallback calculation if Sleeper projections return 0 across the board
        const totalFpts = (r.settings?.fpts || 0) + ((r.settings?.fpts_decimal || 0) / 100);
        const wins = r.settings?.wins || 0;
        const losses = r.settings?.losses || 0;
        const totalGames = (wins + losses) || 1;
        const fallbackPPG = totalFpts / totalGames;

        let totalStarterProj = 0;
        let posBreakdown = { QB: 0, RB: 0, WR: 0, TE: 0 };

        starters.forEach((pid, idx) => {
          const proj = projMap[pid] || 0;
          totalStarterProj += proj;

          const slot = rosterPositions[idx] || 'FLEX';
          if (posBreakdown[slot] !== undefined) {
            posBreakdown[slot] += proj;
          }
        });

        // If projections returned 0 for everyone (off-season/pre-season), use actual season average PPG
        const isProjectionsEmpty = totalStarterProj === 0;
        const finalPPG = isProjectionsEmpty ? fallbackPPG : totalStarterProj;

        // Bench points calculation
        const bench = players.filter(p => !starters.includes(p));
        let benchProj = 0;
        bench.forEach(pid => {
          benchProj += (projMap[pid] || 0);
        });

        return {
          roster_id: r.roster_id,
          name: teamName,
          finalPPG: finalPPG,
          starterProjDisplay: finalPPG.toFixed(1),
          benchProjDisplay: (isProjectionsEmpty ? (bench.length * 1.5) : benchProj).toFixed(1),
          posBreakdown,
          compositeScore: finalPPG + (isProjectionsEmpty ? 0 : (benchProj * 0.1))
        };
      });

      // 4. Calculate Power Index (0 - 100 Scale)
      const scores = teamScores.map(t => t.compositeScore);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      rankings = teamScores.map(t => {
        let powerScore = 50;
        if (maxScore !== minScore) {
          powerScore = (((t.compositeScore - minScore) / (maxScore - minScore)) * 40 + 60);
        }

        return {
          ...t,
          powerScore: powerScore.toFixed(1)
        };
      }).sort((a, b) => b.compositeScore - a.compositeScore);

      loading = false;
    } catch (err) {
      console.error("Error calculating power rankings:", err);
      errorMsg = "Error loading power rankings data.";
      loading = false;
    }
  });
</script>

{#if loading}
  <p class="loading">Analyzing team strength data...</p>
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
          <th>Projected PPG</th>
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
            <td class="ppg">{team.starterProjDisplay} pts</td>
            <td>{team.benchProjDisplay} pts</td>
            <td>{team.posBreakdown.QB > 0 ? team.posBreakdown.QB.toFixed(1) : '-'}</td>
            <td>{team.posBreakdown.RB > 0 ? team.posBreakdown.RB.toFixed(1) : '-'}</td>
            <td>{team.posBreakdown.WR > 0 ? team.posBreakdown.WR.toFixed(1) : '-'}</td>
            <td>{team.posBreakdown.TE > 0 ? team.posBreakdown.TE.toFixed(1) : '-'}</td>
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
