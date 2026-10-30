<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket, PROBLEM_LABEL, type Problem } from '#lib/kb/problems';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: where each problem is filed now, problem → URL.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const rows = (reports as Report[]).length;
  const unique = uniqueById(reports as Report[]).length;
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket} ·
  <strong>{split.rows.length}</strong> {split.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each split.rows as p (p.problem)}
      <tr>
        <td><code>{p.problem}</code> {PROBLEM_LABEL[p.problem]}</td>
        <td>{p.reports}{p.alsoIn.length ? '*' : ''}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>{#if tickets[p.problem]}<a href={tickets[p.problem]}>{tickets[p.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.rows.filter((p) => p.alsoIn.length) as p (p.problem)}
  <p class="note">* The {p.reports} {PROBLEM_LABEL[p.problem]} reports stay counted under <code>{p.alsoIn.join(', ')}</code>, where the desk files them by tenant.</p>
{/each}
<p class="note">The export has {rows} rows; {rows - unique} are repeats from overlapping pages, counted once.</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
