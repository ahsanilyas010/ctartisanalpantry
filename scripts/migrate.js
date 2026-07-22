// Idempotent schema + seed script. Safe to run more than once.
// Run locally with: DATABASE_URL=... node scripts/migrate.js
// Or trigger via GET /api/setup?token=<SETUP_TOKEN> once deployed.

const { sql } = require('../lib/db');

const SEED_PRODUCTS = [
  {
    slug: 'vanilla-beans',
    name: 'Vanilla Beans',
    description: 'Madagascar bourbon vanilla beans — whole, hand-cured pods.',
    unit_label: '10 beans',
    price_pkr: 4500,
    stock_quantity: 50,
    image_path: 'images/wholesale-vanilla-beans.jpg',
  },
  {
    slug: 'vanilla-caviar',
    name: 'Vanilla Caviar',
    description: 'Scraped vanilla seeds — maximum aroma, none of the pod.',
    unit_label: '50 g',
    price_pkr: 5500,
    stock_quantity: 50,
    image_path: 'images/wholesale-vanilla-caviar.jpg',
  },
  {
    slug: 'vanilla-bean-paste-honey',
    name: 'Vanilla Bean Paste with Honey',
    description: 'A thick blend of vanilla extract and real scraped seeds, sweetened with honey.',
    unit_label: '50 g',
    price_pkr: 4500,
    stock_quantity: 50,
    image_path: 'images/wholesale-vanilla-paste.jpg',
  },
  {
    slug: 'cocoa-powder',
    name: 'Cocoa — 100% Pure, Unsweetened',
    description: 'Whole Madagascar cacao beans, roasted and stone-milled into a fine powder.',
    unit_label: '250 g',
    price_pkr: 2500,
    stock_quantity: 50,
    image_path: 'images/wholesale-cocoa-powder.jpg',
  },
  {
    slug: 'wild-red-peppercorn',
    name: 'Wild Red Peppercorn',
    description: 'Wild-harvested red peppercorn — bright, floral heat, nothing like the pepper in an average grinder.',
    unit_label: '50 g',
    price_pkr: 3500,
    stock_quantity: 50,
    image_path: 'images/product-peppercorn-tile.jpg',
  },
  {
    slug: 'chili-oil',
    name: 'Chili Oil — The Art of Heat',
    description: 'Crafted in small batches, our chili oil delivers warmth with depth and balance.',
    unit_label: '150 ml',
    price_pkr: 3000,
    stock_quantity: 50,
    image_path: 'images/product-chilioil-bottle.jpg',
  },
];

async function migrate() {
  console.log('Creating tables (if not present)...');

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      unit_label TEXT,
      price_pkr INTEGER NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      image_path TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal_pkr INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price_pkr INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total_pkr INTEGER NOT NULL
    )
  `;

  console.log('Seeding products (skipping any that already exist)...');
  for (const p of SEED_PRODUCTS) {
    await sql`
      INSERT INTO products (slug, name, description, unit_label, price_pkr, stock_quantity, image_path)
      VALUES (${p.slug}, ${p.name}, ${p.description}, ${p.unit_label}, ${p.price_pkr}, ${p.stock_quantity}, ${p.image_path})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  console.log('Done.');
}

module.exports = { migrate };

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
