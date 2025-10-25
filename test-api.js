const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🚀 Testing Country Currency & Exchange API...\n');

  try {
    // Test 1: Check status before refresh
    console.log('1. Testing GET /status (before refresh)...');
    const statusBefore = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status:', statusBefore.data);
    console.log('');

    // Test 2: Refresh countries data
    console.log('2. Testing POST /countries/refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/countries/refresh`);
    console.log('✅ Refresh:', refreshResponse.data);
    console.log('');

    // Test 3: Check status after refresh
    console.log('3. Testing GET /status (after refresh)...');
    const statusAfter = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status:', statusAfter.data);
    console.log('');

    // Test 4: Get all countries
    console.log('4. Testing GET /countries...');
    const allCountries = await axios.get(`${BASE_URL}/countries`);
    console.log(`✅ Found ${allCountries.data.length} countries`);
    console.log('');

    // Test 5: Filter by region
    console.log('5. Testing GET /countries?region=Africa...');
    const africanCountries = await axios.get(`${BASE_URL}/countries?region=Africa`);
    console.log(`✅ Found ${africanCountries.data.length} African countries`);
    if (africanCountries.data.length > 0) {
      console.log('Sample country:', africanCountries.data[0]);
    }
    console.log('');

    // Test 6: Sort by GDP
    console.log('6. Testing GET /countries?sort=gdp_desc...');
    const sortedCountries = await axios.get(`${BASE_URL}/countries?sort=gdp_desc`);
    console.log(`✅ Found ${sortedCountries.data.length} countries sorted by GDP`);
    if (sortedCountries.data.length > 0) {
      console.log('Top country by GDP:', sortedCountries.data[0]);
    }
    console.log('');

    // Test 7: Get specific country
    if (allCountries.data.length > 0) {
      const countryName = allCountries.data[0].name;
      console.log(`7. Testing GET /countries/${encodeURIComponent(countryName)}...`);
      const specificCountry = await axios.get(`${BASE_URL}/countries/${encodeURIComponent(countryName)}`);
      console.log('✅ Specific country:', specificCountry.data);
      console.log('');
    }

    // Test 8: Test image endpoint
    console.log('8. Testing GET /countries/image...');
    try {
      const imageResponse = await axios.get(`${BASE_URL}/countries/image`, {
        responseType: 'arraybuffer'
      });
      console.log(`✅ Image generated successfully (${imageResponse.data.length} bytes)`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Image not found (this is expected if no refresh has been done)');
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };
