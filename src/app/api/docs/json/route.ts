// app/api/docs/json/route.ts
import { NextResponse } from 'next/server'
import swaggerSpec from '@/lib/swagger'

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
