export const maxDuration = 120 // allow longer execution for AI analysis

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuid } from 'uuid'
import { saveAudit } from '@/lib/store'
import { FREE_AUDIT_PROMPT, FULL_AUDIT_PROMPT } from '@/lib/prompts'
import type { AuditFull } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { images, inputType, inputLabel, tier: rawTier = 'free', adminSecret } = body

    // Owner bypass — if admin secret matches, treat as full tier automatically
    const isOwner = adminSecret && adminSecret === (process.env.SEED_SECRET || 'ruonalim-seed-2026')
    const tier = isOwner ? 'full' : rawTier

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    if (images.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 images allowed' }, { status: 400 })
    }

    // Always run full analysis — data is gated at the response level
    const prompt = FULL_AUDIT_PROMPT

    // Build content array with images — detect PNG vs JPEG from base64 header
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any[] = images.map((img: string) => {
      const raw = img.replace(/^data:image\/\w+;base64,/, '')
      // PNG starts with iVBOR, JPEG with /9j/, GIF with R0lG, WebP with UklG
      let mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' = 'image/png'
      if (raw.startsWith('/9j/')) mediaType = 'image/jpeg'
      else if (raw.startsWith('R0lG')) mediaType = 'image/gif'
      else if (raw.startsWith('UklG')) mediaType = 'image/webp'

      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mediaType,
          data: raw,
        },
      }
    })

    content.push({ type: 'text', text: prompt })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content }],
    })

    // Extract JSON from response
    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 })
    }

    let parsed
    try {
      // Try to extract JSON from the response (handle cases where Claude adds extra text)
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: textBlock.text }, { status: 500 })
    }

    const auditId = uuid()
    const audit: AuditFull = {
      auditId,
      overallScore: parsed.overallScore,
      headline: parsed.headline,
      totalIssuesFound: parsed.totalIssuesFound,
      previewIssues: parsed.previewIssues || [],
      lockedIssueCount: tier === 'full' ? 0 : Math.max(0, (parsed.totalIssuesFound || 0) - 3),
      topStrength: parsed.topStrength,
      inputType: inputType || 'screenshots',
      inputLabel: inputLabel || 'Uploaded screenshots',
      createdAt: new Date().toISOString(),
      heuristics: parsed.heuristics || [],
      criticalIssues: parsed.criticalIssues || [],
      majorIssues: parsed.majorIssues || [],
      minorIssues: parsed.minorIssues || [],
      strengths: parsed.strengths || [],
      priorityActions: parsed.priorityActions || [],
      paid: tier === 'full',
      conversionScore: parsed.conversionScore,
      mobileScore: parsed.mobileScore,
      trustScore: parsed.trustScore,
      seoScore: parsed.seoScore,
      appScore: parsed.appScore,
    }

    await saveAudit(audit)

    // Return preview for free tier, full for paid
    if (tier === 'full') {
      return NextResponse.json(audit)
    }

    return NextResponse.json({
      auditId: audit.auditId,
      overallScore: audit.overallScore,
      headline: audit.headline,
      totalIssuesFound: audit.totalIssuesFound,
      previewIssues: audit.previewIssues,
      lockedIssueCount: audit.lockedIssueCount,
      topStrength: audit.topStrength,
      inputType: audit.inputType,
      inputLabel: audit.inputLabel,
      createdAt: audit.createdAt,
    })
  } catch (error: unknown) {
    console.error('Audit analysis error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
