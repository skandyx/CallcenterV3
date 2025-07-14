// src/app/api/data/delete/route.ts
import { NextResponse } from 'next/server';
import { clearAllData } from '@/lib/data';

export async function POST() {
  try {
    await clearAllData();
    return NextResponse.json({ message: 'All data has been deleted.' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/data/delete:', error);
    return NextResponse.json({ message: 'Error deleting data.' }, { status: 500 });
  }
}
