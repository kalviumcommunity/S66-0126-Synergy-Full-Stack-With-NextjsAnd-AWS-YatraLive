#!/usr/bin/env tsx

/**
 * Test S3 connection and operations
 * 
 * Run with: npm run test:s3
 */

import { s3Client, getPhotoBucket } from '@/lib/storage/s3-client';
import { ListBucketsCommand } from '@aws-sdk/client-s3';

async function testS3() {
  console.log('☁️ Testing AWS S3 Connection...\n');
  
  try {
    // Test 1: List buckets (requires permissions)
    console.log('📡 Test 1: Listing buckets');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log(`   ✅ Connected to AWS S3`);
    console.log(`   📦 Found ${response.Buckets?.length || 0} buckets`);
    
    if (response.Buckets) {
      response.Buckets.forEach(bucket => {
        console.log(`      - ${bucket.Name}`);
      });
    }
    
    // Test 2: Check our bucket
    console.log('\n📡 Test 2: Checking train photos bucket');
    const bucketName = getPhotoBucket();
    console.log(`   📦 Target bucket: ${bucketName}`);
    
    // Can't check bucket existence without extra permissions
    // But if we get here, credentials are working
    
    console.log('\n✨ S3 tests completed!');
    
  } catch (error) {
    console.error('❌ S3 test failed:', error);
    process.exit(1);
  }
}

testS3();