import 'dotenv/config';
import { getAllWhopMemberships, getWhopProductTier } from './lib/whop-client';

async function testWhopSync() {
  try {
    console.log('🔄 Testing Whop API with new permissions...');
    console.log('API Key present:', process.env.WHOP_API_KEY ? 'Yes (hidden)' : 'No');
    console.log('');
    
    const memberships = await getAllWhopMemberships();
    
    console.log('✅ SUCCESS! Whop API is working!');
    console.log('📊 Total memberships found:', memberships.length);
    console.log('');
    
    if (memberships.length > 0) {
      console.log('=== Sample Membership ===');
      console.log('User ID:', memberships[0].userId);
      console.log('Email:', memberships[0].userEmail || 'Not provided');
      console.log('Name:', memberships[0].userName || 'Not provided');
      console.log('Product ID:', memberships[0].productId);
      console.log('Valid:', memberships[0].valid);
      console.log('');
      
      // Count unique users
      const uniqueUserIds = new Set(memberships.map(m => m.userId));
      console.log('📈 Total unique Whop users:', uniqueUserIds.size);
      console.log('');
      
      // Group by product to see tier distribution
      const byProduct: Record<string, { count: number; tier: string }> = {};
      memberships.forEach(m => {
        if (!byProduct[m.productId]) {
          byProduct[m.productId] = {
            count: 0,
            tier: getWhopProductTier(m.productId)
          };
        }
        byProduct[m.productId].count++;
      });
      
      console.log('=== Memberships by Product/Tier ===');
      Object.entries(byProduct).forEach(([productId, data]) => {
        console.log(`  ${productId}: ${data.count} memberships (${data.tier} tier)`);
      });
      console.log('');
      
      // Count active vs inactive
      const activeMemberships = memberships.filter(m => m.valid);
      console.log('=== Membership Status ===');
      console.log('  Active:', activeMemberships.length);
      console.log('  Inactive:', memberships.length - activeMemberships.length);
      console.log('');
      
    } else {
      console.log('⚠️  No memberships found.');
      console.log('');
      console.log('Possible reasons:');
      console.log('  1. No customers have purchased yet');
      console.log('  2. API permissions need time to propagate (try again in 5 min)');
      console.log('  3. The API key may need to be regenerated in Whop dashboard');
      console.log('');
    }
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Full error details:');
    console.error(error);
  }
}

testWhopSync();
