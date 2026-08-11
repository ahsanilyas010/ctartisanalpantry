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

const SEED_BLOG_POSTS = [
  {
    slug: 'vanilla-beans-caviar-paste',
    title: 'Vanilla Beans, Caviar, or Paste: Which Should You Use?',
    excerpt: "A baker's guide to the three forms of Madagascar bourbon vanilla — and when each one earns its place in a recipe.",
    cover_image: 'images/blog-vanilla-forms.jpg',
    custom_url: 'blog/vanilla-beans-caviar-paste.html',
  },
  {
    slug: 'wild-red-peppercorn',
    title: 'What Makes Wild Red Peppercorn Different From Black Pepper',
    excerpt: "Same vine, different story: why wild-harvested red peppercorn tastes nothing like the pepper in your average grinder.",
    cover_image: 'images/blog-peppercorn.jpg',
    custom_url: 'blog/wild-red-peppercorn.html',
  },
  {
    slug: 'single-origin-cocoa-101',
    title: 'Single-Origin Cocoa 101: From Bean to Powder',
    excerpt: "What \"single-origin\" actually means, how stone-milling changes flavour, and why unsweetened doesn't mean bland.",
    cover_image: 'images/blog-cocoa.jpg',
    custom_url: 'blog/single-origin-cocoa-101.html',
  },
  {
    slug: 'art-of-chili-oil',
    title: 'The Art of Chili Oil: A Small-Batch Story',
    excerpt: 'Why good chili oil is a balancing act, not a heat contest — and what small-batch production changes about the result.',
    cover_image: 'images/blog-chili-oil-bottle.jpg',
    custom_url: 'blog/art-of-chili-oil.html',
  },
  {
    slug: 'madagascar-growing-regions',
    title: "Why Origin Matters: Madagascar's Growing Regions",
    excerpt: "Climate, soil, and cultivation shape flavour long before an ingredient reaches a kitchen — here's how, region by region.",
    cover_image: 'images/blog-madagascar-origins.jpg',
    custom_url: 'blog/madagascar-growing-regions.html',
  },
  {
    slug: 'cooking-with-the-pantry',
    title: 'From Kitchen to Wholesale: Cooking (and Sourcing) With CT Artisanal Pantry',
    excerpt: 'A practical guide for home cooks and food businesses alike — how to use, store, and buy our ingredients at any scale.',
    cover_image: 'images/blog-cooking.jpg',
    custom_url: 'blog/cooking-with-the-pantry.html',
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

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      body_html TEXT,
      meta_description TEXT,
      custom_url TEXT,
      published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

  console.log('Seeding blog posts (skipping any that already exist)...');
  for (const b of SEED_BLOG_POSTS) {
    await sql`
      INSERT INTO blog_posts (slug, title, excerpt, cover_image, custom_url)
      VALUES (${b.slug}, ${b.title}, ${b.excerpt}, ${b.cover_image}, ${b.custom_url})
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
