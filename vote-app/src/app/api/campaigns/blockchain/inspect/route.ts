import { NextResponse } from 'next/server';

// Helper function to find empty keys in an object
function findEmptyKeys(obj, path = '') {
  const issues = [];
  
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return issues;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const childIssues = findEmptyKeys(item, `${path}[${index}]`);
      issues.push(...childIssues);
    });
    return issues;
  }
  
  // Handle objects
  for (const [key, value] of Object.entries(obj)) {
    if (key === '') {
      issues.push(`Empty key found at ${path}`);
    }
    
    const childIssues = findEmptyKeys(value, path ? `${path}.${key}` : key);
    issues.push(...childIssues);
  }
  
  return issues;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Find any empty keys in the data
    const issues = findEmptyKeys(data);
    
    // Check for other potential issues
    const potentialIssues = [];
    
    // Check for missing required fields
    if (!data.campaign_id) potentialIssues.push('Missing campaign_id');
    if (!data.title) potentialIssues.push('Missing title');
    if (!data.description) potentialIssues.push('Missing description');
    if (!data.candidates) potentialIssues.push('Missing candidates');
    
    // Check candidates format
    if (data.candidates && Array.isArray(data.candidates)) {
      data.candidates.forEach((candidate, index) => {
        if (!candidate.id) potentialIssues.push(`Candidate ${index} missing id`);
        if (!candidate.name) potentialIssues.push(`Candidate ${index} missing name`);
      });
    }
    
    return NextResponse.json({
      originalData: data,
      emptyKeyIssues: issues,
      potentialIssues: potentialIssues.length > 0 ? potentialIssues : null,
      hasIssues: issues.length > 0 || potentialIssues.length > 0
    });
  } catch (error) {
    console.error('Error inspecting data:', error);
    return NextResponse.json(
      { error: 'Failed to inspect data' },
      { status: 500 }
    );
  }
} 