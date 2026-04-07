import { NextRequest, NextResponse } from 'next/server'
import { getAudit } from '@/lib/store'
import type { AuditFull, HeuristicScore, AuditIssue, ExtendedScore } from '@/lib/types'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#ca8a04'
  if (score >= 40) return '#ea580c'
  return '#dc2626'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'Fair'
  if (score >= 40) return 'Weak'
  return 'Critical'
}

function severityColor(severity: string): string {
  if (severity === 'critical') return '#dc2626'
  if (severity === 'major') return '#ea580c'
  return '#ca8a04'
}

function severityBg(severity: string): string {
  if (severity === 'critical') return '#fff5f5'
  if (severity === 'major') return '#fff8f5'
  return '#fefce8'
}

function generateHtml(audit: AuditFull): string {
  const heuristicsHtml = audit.heuristics.map((h: HeuristicScore) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;color:#96969E;font-size:12px;font-weight:600;white-space:nowrap;">${String(h.id).padStart(2, '0')}.</td>
      <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;color:#111111;font-size:13px;font-weight:600;">${escapeHtml(h.name)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;text-align:center;white-space:nowrap;">
        <span style="display:inline-block;min-width:36px;padding:3px 8px;border-radius:4px;background:${scoreColor(h.score)}18;color:${scoreColor(h.score)};font-weight:700;font-size:13px;">${h.score}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;color:#96969E;font-size:12px;line-height:1.6;">${escapeHtml(h.finding)}</td>
    </tr>
  `).join('')

  const issuesHtml = [...(audit.criticalIssues || []), ...(audit.majorIssues || []), ...(audit.minorIssues || [])].map((issue: AuditIssue) => `
    <div style="margin-bottom:12px;padding:20px 24px;background:#FAFAFA;border-radius:4px;border:1px solid #E8E8EC;border-left:3px solid ${severityColor(issue.severity)};">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${severityColor(issue.severity)};background:${severityBg(issue.severity)};padding:3px 8px;border-radius:3px;">${escapeHtml(issue.severity)}</span>
        <span style="font-size:14px;font-weight:600;color:#111111;">${escapeHtml(issue.title)}</span>
      </div>
      <p style="font-size:13px;color:#141414;margin:0 0 10px;line-height:1.65;">${escapeHtml(issue.description)}</p>
      <p style="font-size:12px;color:#0044E4;margin:0;font-weight:500;">Fix → ${escapeHtml(issue.recommendation)}</p>
      ${issue.location ? `<p style="font-size:10px;color:#96969E;margin:8px 0 0;text-transform:uppercase;letter-spacing:0.1em;">${escapeHtml(issue.location)}</p>` : ''}
    </div>
  `).join('')

  const strengthsHtml = audit.strengths.map((s: string) => `
    <li style="padding:12px 0;border-bottom:1px solid #E8E8EC;color:#141414;font-size:13px;line-height:1.65;display:flex;gap:12px;align-items:flex-start;">
      <span style="color:#0044E4;font-weight:700;flex-shrink:0;margin-top:1px;">★</span>
      <span>${escapeHtml(s)}</span>
    </li>
  `).join('')

  const actionsHtml = audit.priorityActions.map((a: string, i: number) => `
    <li style="padding:14px 0;border-bottom:1px solid #E8E8EC;color:#141414;font-size:13px;line-height:1.65;display:flex;gap:14px;align-items:flex-start;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#EAF0FF;color:#0044E4;font-weight:700;font-size:11px;flex-shrink:0;margin-top:1px;">${i + 1}</span>
      <span>${escapeHtml(a)}</span>
    </li>
  `).join('')

  const extendedDimensions = [
    { key: 'conversionScore', label: 'Conversion Quality', icon: '↗' },
    { key: 'mobileScore', label: 'Mobile Experience', icon: '⊡' },
    { key: 'trustScore', label: 'Trust & Credibility', icon: '◈' },
  ] as { key: keyof AuditFull; label: string; icon: string }[]

  const extendedHtml = extendedDimensions
    .filter(d => audit[d.key])
    .map(d => {
      const dim = audit[d.key] as ExtendedScore
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;color:#96969E;font-size:14px;">${d.icon}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;color:#111111;font-size:13px;font-weight:600;">${escapeHtml(d.label)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;text-align:center;">
            <span style="display:inline-block;min-width:36px;padding:3px 8px;border-radius:4px;background:${scoreColor(dim.score)}18;color:${scoreColor(dim.score)};font-weight:700;font-size:13px;">${dim.score}</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E8E8EC;color:#96969E;font-size:12px;line-height:1.6;">${escapeHtml(dim.finding)}</td>
        </tr>
      `
    }).join('')

  const scoreRingColor = scoreColor(audit.overallScore)
  const scoreRingLabel = scoreLabel(audit.overallScore)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, Helvetica Neue, Arial, sans-serif;
      background: #FFFFFF;
      color: #141414;
      padding: 56px 64px;
      max-width: 960px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .section-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #96969E;
      margin-bottom: 20px;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      padding: 8px 16px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #96969E;
      border-bottom: 1px solid #E8E8EC;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:56px;padding-bottom:24px;border-bottom:1px solid #E8E8EC;">
    <div>
      <p style="font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#111111;">ruonalim<span style="color:#0044E4;">.</span></p>
      <p style="font-size:11px;color:#96969E;margin-top:3px;font-weight:500;letter-spacing:0.04em;">UX AUDIT REPORT</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:12px;color:#111111;font-weight:500;">${escapeHtml(audit.inputLabel)}</p>
      <p style="font-size:11px;color:#96969E;margin-top:3px;">${new Date(audit.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <!-- SCORE HERO -->
  <div style="display:flex;align-items:center;gap:48px;margin-bottom:64px;padding:40px 48px;border:1px solid #E8E8EC;border-radius:6px;">
    <div style="text-align:center;flex-shrink:0;">
      <div style="width:96px;height:96px;border-radius:50%;border:3px solid ${scoreRingColor};display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">
        <span style="font-size:36px;font-weight:800;color:${scoreRingColor};letter-spacing:-2px;">${audit.overallScore}</span>
      </div>
      <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${scoreRingColor};">${scoreRingLabel}</span>
    </div>
    <div>
      <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.8px;line-height:1.15;color:#111111;margin-bottom:10px;">${escapeHtml(audit.headline)}</h1>
      <p style="font-size:13px;color:#96969E;font-weight:500;">${audit.totalIssuesFound} issues found</p>
    </div>
  </div>

  <!-- HEURISTIC SCORECARD -->
  <div style="margin-bottom:56px;">
    <p class="section-label">Heuristic Scorecard</p>
    <table>
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Heuristic</th>
          <th style="width:80px;text-align:center;">Score</th>
          <th>Finding</th>
        </tr>
      </thead>
      <tbody>${heuristicsHtml}</tbody>
    </table>
  </div>

  ${extendedHtml ? `
  <!-- EXTENDED ANALYSIS -->
  <div style="margin-bottom:56px;">
    <p class="section-label">Extended Analysis</p>
    <table>
      <thead>
        <tr>
          <th style="width:40px;"></th>
          <th>Dimension</th>
          <th style="width:80px;text-align:center;">Score</th>
          <th>Finding</th>
        </tr>
      </thead>
      <tbody>${extendedHtml}</tbody>
    </table>
  </div>
  ` : ''}

  <!-- ALL ISSUES -->
  <div style="margin-bottom:56px;">
    <p class="section-label">All Issues (${audit.totalIssuesFound})</p>
    ${issuesHtml}
  </div>

  <!-- PRIORITY ACTIONS -->
  <div style="margin-bottom:56px;">
    <p class="section-label">Priority Actions</p>
    <ol style="list-style:none;padding:0;">${actionsHtml}</ol>
  </div>

  <!-- STRENGTHS -->
  <div style="margin-bottom:56px;">
    <p class="section-label">Strengths</p>
    <ul style="list-style:none;padding:0;">${strengthsHtml}</ul>
  </div>

  <!-- FOOTER -->
  <div style="padding-top:24px;border-top:1px solid #E8E8EC;display:flex;justify-content:space-between;align-items:center;">
    <p style="font-size:13px;font-weight:800;letter-spacing:-0.3px;color:#111111;">ruonalim<span style="color:#0044E4;">.</span></p>
    <p style="font-size:11px;color:#96969E;">Generated by AI · ruonalim.com/audit</p>
  </div>

</body>
</html>`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const audit = await getAudit(id)

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  }

  if (!audit.paid) {
    return NextResponse.json({ error: 'Audit not paid — unlock to export PDF' }, { status: 402 })
  }

  const html = generateHtml(audit)

  // Return HTML that the client can print to PDF via browser
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
