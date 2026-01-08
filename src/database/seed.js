const db = require('../../config/database');

async function seedDatabase() {
  try {
    console.log('Seeding database with test data...');

    const teams = [
      { name: 'New York Yankees', league: 'MLB', city: 'New York', season: 2024, total_games: 162 },
      { name: 'Los Angeles Lakers', league: 'NBA', city: 'Los Angeles', season: 2024, total_games: 82 },
      { name: 'Dallas Cowboys', league: 'NFL', city: 'Dallas', season: 2024, total_games: 17 },
    ];

    for (const team of teams) {
      await db.query(
        'INSERT OR IGNORE INTO teams (name, league, city, season, total_games) VALUES (?, ?, ?, ?, ?)',
        [team.name, team.league, team.city, team.season, team.total_games]
      );
      console.log(`✓ Inserted team: ${team.name}`);
    }

    const teamsResult = await db.query('SELECT id, name FROM teams');
    const teamMap = {};
    teamsResult.rows.forEach(team => {
      teamMap[team.name] = team.id;
    });

    const packages = [
      { team_id: teamMap['New York Yankees'], name: 'Gold Package', num_games: 20, price: 5000, section: '101' },
      { team_id: teamMap['New York Yankees'], name: 'Silver Package', num_games: 10, price: 2500, section: '202' },
      { team_id: teamMap['Los Angeles Lakers'], name: 'Premium', num_games: 30, price: 7500, section: '100' },
      { team_id: teamMap['Los Angeles Lakers'], name: 'Standard', num_games: 15, price: 3750, section: '300' },
      { team_id: teamMap['Dallas Cowboys'], name: 'VIP', num_games: 8, price: 10000, section: '1' },
    ];

    for (const pkg of packages) {
      await db.query(
        'INSERT OR IGNORE INTO packages (team_id, name, num_games, price, section) VALUES (?, ?, ?, ?, ?)',
        [pkg.team_id, pkg.name, pkg.num_games, pkg.price, pkg.section]
      );
      console.log(`✓ Inserted package: ${pkg.name}`);
    }

    const packagesResult = await db.query('SELECT id, name FROM packages');
    const packageMap = {};
    packagesResult.rows.forEach(pkg => {
      packageMap[pkg.name] = pkg.id;
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); 
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); 
    
    const subscriptions = [
      { user_id: 1, package_id: packageMap['Gold Package'], status: 'active', auto_renew: 1 },
      { user_id: 2, package_id: packageMap['Premium'], status: 'active', auto_renew: 1 },
      { user_id: 3, package_id: packageMap['VIP'], status: 'active', auto_renew: 1 },
    ];

    for (const sub of subscriptions) {
      await db.query(
        'INSERT OR IGNORE INTO subscriptions (user_id, package_id, status, start_date, end_date, auto_renew) VALUES (?, ?, ?, ?, ?, ?)',
        [sub.user_id, sub.package_id, sub.status, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], sub.auto_renew]
      );
      console.log(`✓ Inserted subscription: User ${sub.user_id} - Package ${sub.package_id}`);
    }

    const subsResult = await db.query('SELECT id FROM subscriptions');
    const subIds = subsResult.rows.map(s => s.id);

    if (subIds.length > 0) {
      for (let i = 0; i < subIds.length; i++) {
        for (let gameId = 1; gameId <= 3; gameId++) {
          await db.query(
            'INSERT OR IGNORE INTO game_assignments (subscription_id, game_id, seat_number, used) VALUES (?, ?, ?, ?)',
            [subIds[i], gameId, Math.floor(Math.random() * 20000) + 1, 0]
          );
        }
      }
      console.log(`✓ Inserted game assignments for ${subIds.length} subscriptions`);
    }

    console.log('✓ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
  

