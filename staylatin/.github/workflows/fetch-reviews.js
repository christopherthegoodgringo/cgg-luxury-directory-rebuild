#!/usr/bin/env node

/**
 * StayLatin Review Fetcher
 * Automatically pulls latest reviews from Expedia and Trip.com
 * Updates index.html with real guest reviews
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const PROPERTIES = {
  16: { name: 'Hilton Santa Marta', trip: 'https://us.trip.com/hotels/santa-marta-hotel-detail-100619308/hilton-santa-marta/', expedia: 'https://www.expedia.com/Santa-Marta-Hotels-Hilton-Santa-Marta.h87909595.Hotel-Information' },
  4: { name: 'Casa Zarah', trip: 'https://www.trip.com/hotels/santa-marta-hotel-detail-113174713/casa-zarah-alma-hotels/', expedia: 'https://www.expedia.com/Santa-Marta-Hotels-Casa-Zarah-Alma-Hotels.h125694943.Hotel-Information' },
  9: { name: 'Casa Bugambilia', trip: 'https://www.trip.com/hotels/santa-marta-hotel-detail-13265595/casa-bugambilia/', expedia: 'https://www.expedia.com/Santa-Marta-Hotels-Casa-Bugambilia-Alma-Hotels.h125768174.Hotel-Information' },
  10: { name: 'Casa Gaitana', trip: 'https://nz.trip.com/hotels/santa-marta-hotel-detail-113582005/casa-gaitana-hotel-gaitano/', expedia: 'https://www.expedia.com/Santa-Marta-Hotels-Vrbo-Property.h120626192.Hotel-Information' }
};

// Fetch HTML from URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse Trip.com reviews
async function fetchTripComReviews(propertyId, url) {
  try {
    console.log(`Fetching Trip.com reviews for property ${propertyId}...`);
    const html = await fetchUrl(url);
    const reviews = [];

    // Trip.com review extraction pattern
    const reviewRegex = /"commentDtoList":\[(.*?)\]/s;
    const match = html.match(reviewRegex);

    if (match) {
      try {
        const reviewData = JSON.parse('[' + match[1] + ']');
        reviewData.slice(0, 5).forEach(review => {
          if (review.mainComment && review.ratingDtoList) {
            reviews.push({
              text: review.mainComment.trim(),
              rating: review.ratingDtoList[0]?.score || 8,
              reviewer: review.userName || 'Guest User, Trip.com'
            });
          }
        });
      } catch (e) {
        console.warn(`Could not parse Trip.com JSON for property ${propertyId}`);
      }
    }

    return reviews;
  } catch (error) {
    console.error(`Error fetching Trip.com reviews: ${error.message}`);
    return [];
  }
}

// Parse Expedia reviews
async function fetchExpediaReviews(propertyId, url) {
  try {
    console.log(`Fetching Expedia reviews for property ${propertyId}...`);
    const html = await fetchUrl(url);
    const reviews = [];

    // Expedia review extraction pattern
    const reviewRegex = /"reviews":\[(.*?)\](?=,"reviewSummary")/s;
    const match = html.match(reviewRegex);

    if (match) {
      try {
        const reviewData = JSON.parse('[' + match[1] + ']');
        reviewData.slice(0, 5).forEach(review => {
          if (review.text && review.ratingDescription) {
            reviews.push({
              text: review.text.trim(),
              rating: review.rating || 8,
              reviewer: review.reviewerName || 'Guest User, Expedia'
            });
          }
        });
      } catch (e) {
        console.warn(`Could not parse Expedia JSON for property ${propertyId}`);
      }
    }

    return reviews;
  } catch (error) {
    console.error(`Error fetching Expedia reviews: ${error.message}`);
    return [];
  }
}

// Update index.html with new reviews
function updateIndexFile(reviews) {
  const indexPath = path.join(__dirname, '..', 'staylatin', 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error(`index.html not found at ${indexPath}`);
    return false;
  }

  let content = fs.readFileSync(indexPath, 'utf8');

  // Build new reviewDatabase object
  let newReviewDatabase = 'const reviewDatabase={\n';

  Object.entries(reviews).forEach(([id, revs]) => {
    if (revs.length > 0) {
      newReviewDatabase += `    ${id}:[`;
      revs.forEach((rev, idx) => {
        newReviewDatabase += `\n      {text:"${rev.text.replace(/"/g, '\\"')}",rating:${rev.rating},reviewer:"${rev.reviewer.replace(/"/g, '\\"')}"}`;
        if (idx < revs.length - 1) newReviewDatabase += ',';
      });
      newReviewDatabase += '\n    ],\n';
    }
  });

  newReviewDatabase += '  };';

  // Replace old reviewDatabase
  const oldReviewDbRegex = /const reviewDatabase=\{[\s\S]*?\};/;
  content = content.replace(oldReviewDbRegex, newReviewDatabase);

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✓ Updated index.html with new reviews');
  return true;
}

// Main execution
async function main() {
  console.log('🔄 Starting StayLatin Review Fetcher...\n');

  const allReviews = {};

  for (const [id, property] of Object.entries(PROPERTIES)) {
    console.log(`\n📍 ${property.name} (ID: ${id})`);

    // Try to fetch from both sources
    const tripReviews = await fetchTripComReviews(id, property.trip);
    const expediaReviews = await fetchExpediaReviews(id, property.expedia);

    // Combine reviews (prioritize recent ones)
    allReviews[id] = [...tripReviews, ...expediaReviews].slice(0, 5);

    console.log(`  ✓ Found ${allReviews[id].length} reviews`);
  }

  // Update the file
  const updated = updateIndexFile(allReviews);

  if (updated) {
    console.log('\n✅ All reviews updated successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Failed to update reviews');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
