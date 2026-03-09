/**
 * API Route للتطور الذاتي
 * يتواصل مع Evolution Service على المنفذ 3005
 */

import { NextRequest, NextResponse } from 'next/server'

const EVOLUTION_SERVICE_URL = 'http://localhost:3005/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    const response = await fetch(`${EVOLUTION_SERVICE_URL}?XTransformPort=3005`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Evolution service unavailable' },
        { status: 503 }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    // إذا كانت الخدمة غير متاحة، أعد بيانات محاكاة
    return NextResponse.json({
      success: true,
      stats: {
        trustLevel: 0,
        stage: 'infant',
        stageDescription: '🥚 الرضيع - يحتاج موافقة لكل تغيير',
        totalEvolutions: 0,
        successfulEvolutions: 0,
        failedEvolutions: 0,
        pendingProposals: 0,
        isRunning: false,
        canAutoEvolve: false
      }
    })
  }
}

export async function GET() {
  try {
    const response = await fetch(`http://localhost:3005/api?XTransformPort=3005`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stats' })
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Evolution service unavailable' },
        { status: 503 }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch {
    // بيانات محاكاة
    return NextResponse.json({
      success: true,
      stats: {
        trustLevel: 0,
        stage: 'infant',
        stageDescription: '🥚 الرضيع - يحتاج موافقة لكل تغيير',
        totalEvolutions: 0,
        successfulEvolutions: 0,
        failedEvolutions: 0,
        pendingProposals: 0,
        isRunning: false,
        canAutoEvolve: false
      }
    })
  }
}
