import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'user-data.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read existing data
function readData() {
  ensureDataDirectory();
  if (!fs.existsSync(DATA_FILE)) {
    return { submissions: [], interactions: [] };
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { submissions: [], interactions: [] };
  }
}

// Write data to file
function writeData(data: any) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// GET - Retrieve all saved data
export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}

// POST - Save new data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readData();
    
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...body
    };

    if (body.type === 'submission') {
      data.submissions.push(newEntry);
    } else if (body.type === 'interaction') {
      data.interactions.push(newEntry);
    }

    const success = writeData(data);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data saved successfully',
        id: newEntry.id 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/data:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}

// DELETE - Clear all data (optional)
export async function DELETE() {
  try {
    const success = writeData({ submissions: [], interactions: [] });
    if (success) {
      return NextResponse.json({ success: true, message: 'All data cleared' });
    } else {
      return NextResponse.json(
        { error: 'Failed to clear data' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
