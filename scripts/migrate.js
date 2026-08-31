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

const SEED_CONTENT = [
  // Announcement banner
  { section: 'banner', key: 'active',   value: 'false',                                        content_type: 'boolean', label: 'Show banner',        sort_order: 1 },
  { section: 'banner', key: 'text',     value: 'Free delivery on orders over PKR 5,000',       content_type: 'text',    label: 'Banner text',        sort_order: 2 },
  { section: 'banner', key: 'bg_color', value: '#E2202D',                                      content_type: 'text',    label: 'Background colour',  sort_order: 3 },

  // Hero slides (JSON objects)
  { section: 'hero', key: 'slide_1', content_type: 'json', label: 'Hero Slide 1', sort_order: 1,
    value: JSON.stringify({ image: '/images/hero-slide-vanilla-farm.jpg', headline: 'Flavour from Madagascar', subtext: 'Small-batch Madagascar Bourbon Vanilla', active: true }) },
  { section: 'hero', key: 'slide_2', content_type: 'json', label: 'Hero Slide 2', sort_order: 2,
    value: JSON.stringify({ image: '/images/hero-slide-cocoa.jpg', headline: 'Single-Origin Cocoa', subtext: 'Stone-milled, pure, unsweetened', active: true }) },
  { section: 'hero', key: 'slide_3', content_type: 'json', label: 'Hero Slide 3', sort_order: 3,
    value: JSON.stringify({ image: '/images/hero-slide-vanilla-bundle.jpg', headline: 'The Art of Heat', subtext: 'Small-batch Chili Oil', active: true }) },
  { section: 'hero', key: 'eyebrow',          value: 'CT Artisanal Pantry',         content_type: 'text', label: 'Eyebrow',                 sort_order: 4 },
  { section: 'hero', key: 'heading',           value: 'Flavour from Madagascar',     content_type: 'text', label: 'Main heading',            sort_order: 5 },
  { section: 'hero', key: 'cta_primary_text',  value: 'Explore the Pantry',          content_type: 'text', label: 'Primary CTA text',        sort_order: 6 },
  { section: 'hero', key: 'cta_primary_url',   value: 'shop.html',                   content_type: 'text', label: 'Primary CTA URL',         sort_order: 7 },
  { section: 'hero', key: 'cta_secondary_text',value: 'Bulk Buying / Wholesale',     content_type: 'text', label: 'Secondary CTA text',      sort_order: 8 },
  { section: 'hero', key: 'cta_secondary_url', value: 'wholesale.html',              content_type: 'text', label: 'Secondary CTA URL',       sort_order: 9 },

  // Ticker
  { section: 'ticker', key: 'keywords', content_type: 'json', label: 'Ticker keywords', sort_order: 1,
    value: JSON.stringify(['Flavour, Shaped by Place','Madagascar','Vanilla','Cocoa','Purely Sourced','Naturally Grown','Farm Fresh','Handpicked Quality','Direct From Farm','Ethically Sourced','Carefully Harvested','Naturally Cultivated','Pure Farm Origin','100% Natural']) },

  // Homepage text blocks
  { section: 'homepage', key: 'collection_eyebrow',  value: 'The Pantry',                                                content_type: 'text', label: 'Collection eyebrow',  sort_order: 1 },
  { section: 'homepage', key: 'collection_heading',   value: 'A Small, Considered Collection',                            content_type: 'text', label: 'Collection heading',  sort_order: 2 },
  { section: 'homepage', key: 'ingredients_eyebrow',  value: 'Know Your Ingredients',                                     content_type: 'text', label: 'Ingredients eyebrow', sort_order: 3 },
  { section: 'homepage', key: 'ingredients_heading',  value: 'Four forms, one source of flavour',                         content_type: 'text', label: 'Ingredients heading', sort_order: 4 },
  { section: 'homepage', key: 'signature_eyebrow',    value: 'Signature',                                                 content_type: 'text', label: 'Signature eyebrow',   sort_order: 5 },
  { section: 'homepage', key: 'signature_heading',    value: 'The Art of Heat',                                           content_type: 'text', label: 'Signature heading',   sort_order: 6 },
  { section: 'homepage', key: 'signature_body',       value: 'Crafted in small batches with a base of avocado oil, our chili oil delivers warmth with depth and balance. Designed to elevate simple dishes — from eggs and noodles to roasted vegetables and soups.',
    content_type: 'text', label: 'Signature body', sort_order: 7 },
  { section: 'homepage', key: 'origins_heading',      value: 'Where Flavour Begins',                                      content_type: 'text', label: 'Origins heading',      sort_order: 8 },
  { section: 'homepage', key: 'origins_body',         value: "Climate, soil, and cultivation shape the character of every ingredient in our pantry. From Madagascar's fertile landscapes to remarkable growing regions around the world, each ingredient reflects the place it comes from.",
    content_type: 'text', label: 'Origins body', sort_order: 9 },
  { section: 'homepage', key: 'ingredient_pods_image',   value: '/images/wholesale-vanilla-beans.jpg',   content_type: 'image', label: 'Ingredient card — Vanilla bean pods image',        sort_order: 13 },
  { section: 'homepage', key: 'ingredient_caviar_image',  value: '/images/wholesale-vanilla-caviar.jpg',  content_type: 'image', label: 'Ingredient card — Vanilla caviar image',            sort_order: 14 },
  { section: 'homepage', key: 'ingredient_paste_image',   value: '/images/wholesale-vanilla-paste.jpg',   content_type: 'image', label: 'Ingredient card — Vanilla bean paste image',       sort_order: 15 },
  { section: 'homepage', key: 'ingredient_pepper_image',  value: '/images/product-peppercorn-tile.jpg',   content_type: 'image', label: 'Ingredient card — Red pepper image',                sort_order: 17 },

  { section: 'homepage', key: 'wholesale_eyebrow',    value: 'For Manufacturers, Importers & Brands',                     content_type: 'text', label: 'Wholesale eyebrow',    sort_order: 10 },
  { section: 'homepage', key: 'wholesale_heading',    value: 'Buying in Bulk?',                                           content_type: 'text', label: 'Wholesale heading',    sort_order: 11 },
  { section: 'homepage', key: 'wholesale_body',       value: 'We supply premium, single-origin Madagascar cocoa and vanilla to manufacturers, importers, distributors, and private label brands worldwide.',
    content_type: 'text', label: 'Wholesale body', sort_order: 12 },

  // Shop page
  { section: 'shop', key: 'eyebrow', value: 'The Pantry',                                                                                         content_type: 'text', label: 'Shop eyebrow',  sort_order: 1 },
  { section: 'shop', key: 'heading', value: 'Shop the Full Collection',                                                                            content_type: 'text', label: 'Shop heading',  sort_order: 2 },
  { section: 'shop', key: 'subtext', value: 'A small, considered collection of single-origin ingredients — order directly, pay by cash on delivery or bank transfer.', content_type: 'text', label: 'Shop subtext', sort_order: 3 },

  // Our Story page
  { section: 'our-story', key: 'h1',                   value: 'Great Cooking Begins With Exceptional Ingredients',                               content_type: 'text', label: 'Our Story — Main heading',           sort_order: 1 },
  { section: 'our-story', key: 'intro',                 value: 'CT Artisanal Pantry began with a simple belief — and a family\'s move to Madagascar that changed how we think about flavour.', content_type: 'text', label: 'Our Story — Intro paragraph', sort_order: 2 },
  { section: 'our-story', key: 'how_started_eyebrow',   value: 'How It Started',                                                                  content_type: 'text', label: 'Our Story — How it started eyebrow', sort_order: 3 },
  { section: 'our-story', key: 'how_started_heading',   value: 'A Pantry Worth Trusting',                                                          content_type: 'text', label: 'Our Story — How it started heading', sort_order: 4 },
  { section: 'our-story', key: 'how_started_body',      value: 'Four years ago, we made Madagascar our home. As a family who loves cooking together, we found the ingredients there unlike anything we\'d worked with before — starting with the first vanilla bean we scraped for our favourite chocolate banana milkshake. That discovery became a pantry: a small, considered collection of ingredients we\'d proudly cook with ourselves.', content_type: 'text', label: 'Our Story — Main paragraph', sort_order: 5 },
  { section: 'our-story', key: 'side_image',            value: '/images/madagascar-vanilla-vine.jpg',                                              content_type: 'image', label: 'Our Story — Side image',           sort_order: 6 },
  { section: 'our-story', key: 'landscape_image',       value: '/images/madagascar-farm-landscape.jpg',                                            content_type: 'image', label: 'Our Story — Landscape image',      sort_order: 7 },
  { section: 'our-story', key: 'origins_heading',       value: 'Where Flavour Begins',                                                            content_type: 'text', label: 'Our Story — Origins heading',       sort_order: 8 },
  { section: 'our-story', key: 'origins_body',          value: 'Climate, soil, and cultivation shape the character of every ingredient in our pantry. From Madagascar\'s fertile landscapes to remarkable growing regions around the world, each ingredient reflects the place it comes from.', content_type: 'text', label: 'Our Story — Origins body', sort_order: 9 },
  { section: 'our-story', key: 'traceability_heading',  value: 'Traceable, By Design',                                                            content_type: 'text', label: 'Our Story — Traceability heading',   sort_order: 10 },
  { section: 'our-story', key: 'traceability_body',     value: 'We work directly with growers rather than brokers, so every ingredient can be traced back to a specific region — not just a country of origin on a label.', content_type: 'text', label: 'Our Story — Traceability body', sort_order: 11 },

  // Wholesale page
  { section: 'wholesale', key: 'hero_eyebrow',          value: 'Wholesale & Bulk Orders',                                                          content_type: 'text', label: 'Wholesale — Page eyebrow',     sort_order: 1 },
  { section: 'wholesale', key: 'hero_h1',               value: 'Premium Madagascar Ingredients for Manufacturers, Importers & Brands',             content_type: 'text', label: 'Wholesale — Main heading',      sort_order: 2 },
  { section: 'wholesale', key: 'hero_body1',            value: 'CT Artisanal Pantry supplies premium, single-origin ingredients from Madagascar to food manufacturers, importers, distributors, retailers, and private label brands around the world.', content_type: 'text', label: 'Wholesale — Intro paragraph 1', sort_order: 3 },
  { section: 'wholesale', key: 'hero_body2',            value: 'We work closely with trusted producers to deliver authentic ingredients with consistent quality, transparent sourcing, and dependable supply. Whether you\'re developing a new product, expanding your ingredient portfolio, or looking for a long-term sourcing partner, we\'re here to help.', content_type: 'text', label: 'Wholesale — Intro paragraph 2', sort_order: 4 },
  { section: 'wholesale', key: 'whatsapp_url',          value: 'https://wa.me/923000000000',                                                        content_type: 'text', label: 'Wholesale — WhatsApp URL',       sort_order: 5 },
  { section: 'wholesale', key: 'range_eyebrow',         value: 'Our Ingredients',                                                                   content_type: 'text', label: 'Wholesale — Range eyebrow',     sort_order: 6 },
  { section: 'wholesale', key: 'range_heading',         value: 'Wholesale Product Range',                                                           content_type: 'text', label: 'Wholesale — Range heading',     sort_order: 7 },
  { section: 'wholesale', key: 'cta_heading',           value: "Let's Build Something Exceptional",                                                 content_type: 'text', label: 'Wholesale — Final CTA heading', sort_order: 8 },
  { section: 'wholesale', key: 'cta_body',              value: "Whether you're looking for a reliable supplier of premium Madagascar cocoa, vanilla, or other specialty ingredients, we'd love to discuss how we can support your business.", content_type: 'text', label: 'Wholesale — Final CTA body', sort_order: 9 },

  // Contact page
  { section: 'contact', key: 'heading',           value: 'Get in Touch',                                                                            content_type: 'text', label: 'Contact — Heading',             sort_order: 1 },
  { section: 'contact', key: 'subtext',           value: "Questions about an order, wholesale, or press — we'd love to hear from you.",              content_type: 'text', label: 'Contact — Subtext',             sort_order: 2 },
  { section: 'contact', key: 'whatsapp_display',  value: '+92 300 0000000',                                                                          content_type: 'text', label: 'Contact — WhatsApp display number', sort_order: 3 },
  { section: 'contact', key: 'whatsapp_url',      value: 'https://wa.me/923000000000',                                                               content_type: 'text', label: 'Contact — WhatsApp URL',         sort_order: 4 },
  { section: 'contact', key: 'madagascar_phone',  value: '+261 38 097 9425',                                                                         content_type: 'text', label: 'Contact — Madagascar phone',     sort_order: 5 },
  { section: 'contact', key: 'instagram_handle',  value: '@ctartisanal',                                                                             content_type: 'text', label: 'Contact — Instagram handle',    sort_order: 6 },
  { section: 'contact', key: 'instagram_url',     value: 'https://www.instagram.com/ctartisanal',                                                    content_type: 'text', label: 'Contact — Instagram URL',        sort_order: 7 },
  { section: 'contact', key: 'side_image',        value: '/images/contact-vanilla-bulk.jpg',                                                          content_type: 'image', label: 'Contact — Side image',          sort_order: 8 },

  // Product detail pages
  { section: 'product:vanilla-beans', key: 'page_image',   value: '/images/wholesale-vanilla-beans.jpg',       content_type: 'image', label: 'Image',         sort_order: 1 },
  { section: 'product:vanilla-beans', key: 'what_it_is',   value: 'The whole cured fruit of a climbing orchid, hand-pollinated and slow-cured for months. Packed with thousands of tiny aromatic seeds — the purest, most flavourful form of vanilla you can buy.', content_type: 'text', label: 'What It Is', sort_order: 2 },
  { section: 'product:vanilla-beans', key: 'how_to_use',   value: 'Split lengthwise, scrape the seeds into your mix, then drop the pod in too to infuse milk, cream or syrup. Rinse and reuse the spent pod for vanilla sugar.', content_type: 'text', label: 'How to Use', sort_order: 3 },
  { section: 'product:vanilla-beans', key: 'how_to_store', value: 'Wrap airtight and keep somewhere cool and dark — never the fridge, which dries pods out. Well stored, they stay supple and fragrant for up to two years.', content_type: 'text', label: 'How to Store', sort_order: 4 },
  { section: 'product:vanilla-beans', key: 'tip',          value: "A supple, oily pod is a fresh pod. If a pod dries out, don't bin it — soften it in warm milk, or blitz it into sugar for instant vanilla sugar.", content_type: 'text', label: 'Tip', sort_order: 5 },

  { section: 'product:vanilla-caviar', key: 'page_image',   value: '/images/wholesale-vanilla-caviar.jpg',      content_type: 'image', label: 'Image',         sort_order: 1 },
  { section: 'product:vanilla-caviar', key: 'what_it_is',   value: 'The tiny fragrant seeds scraped from the inside of a cured vanilla pod — all the flavour and signature black flecks without the pod itself.',                content_type: 'text', label: 'What It Is', sort_order: 2 },
  { section: 'product:vanilla-caviar', key: 'how_to_use',   value: 'Stir directly into custards, whipped cream, buttercream, or glazes. No splitting, no scraping — just spoon straight in.',                                    content_type: 'text', label: 'How to Use', sort_order: 3 },
  { section: 'product:vanilla-caviar', key: 'how_to_store', value: 'Keep refrigerated in an airtight container. Use within 3 months for best aroma.',                                                                            content_type: 'text', label: 'How to Store', sort_order: 4 },
  { section: 'product:vanilla-caviar', key: 'tip',          value: 'A little goes a long way — caviar is more concentrated than extract. Start with half a teaspoon where a recipe calls for a full bean.',                      content_type: 'text', label: 'Tip', sort_order: 5 },

  { section: 'product:vanilla-bean-paste-honey', key: 'page_image',   value: '/images/wholesale-vanilla-paste.jpg',      content_type: 'image', label: 'Image',         sort_order: 1 },
  { section: 'product:vanilla-bean-paste-honey', key: 'what_it_is',   value: 'A thick, spoonable blend of real vanilla extract and scraped seeds, gently sweetened with honey — the flavour and look of a whole pod with none of the work.', content_type: 'text', label: 'What It Is', sort_order: 2 },
  { section: 'product:vanilla-bean-paste-honey', key: 'how_to_use',   value: 'Measure by the teaspoon, straight into batters, frostings, and ice cream bases. One teaspoon equals roughly one vanilla pod.',                    content_type: 'text', label: 'How to Use', sort_order: 3 },
  { section: 'product:vanilla-bean-paste-honey', key: 'how_to_store', value: 'Store in a cool, dark place with the lid tightly closed. Refrigerate after opening and use within 6 months.',                                        content_type: 'text', label: 'How to Store', sort_order: 4 },
  { section: 'product:vanilla-bean-paste-honey', key: 'tip',          value: 'Add a teaspoon to your morning coffee or porridge — paste dissolves far more evenly than extract and adds a gentle sweetness.',                    content_type: 'text', label: 'Tip', sort_order: 5 },

  { section: 'product:cocoa-powder', key: 'page_image',   value: '/images/wholesale-cocoa-powder.jpg',      content_type: 'image', label: 'Image',         sort_order: 1 },
  { section: 'product:cocoa-powder', key: 'what_it_is',   value: 'Whole Madagascar cacao beans, roasted and stone-milled into a fine, unsweetened powder — single-origin, with no additives or processing agents.', content_type: 'text', label: 'What It Is', sort_order: 2 },
  { section: 'product:cocoa-powder', key: 'how_to_use',   value: 'Use in baking, hot drinks, or dusted over desserts. Works cup-for-cup as a substitute for any unsweetened cocoa powder.',                      content_type: 'text', label: 'How to Use', sort_order: 3 },
  { section: 'product:cocoa-powder', key: 'how_to_store', value: 'Store in an airtight container, away from heat and moisture. Keeps well for up to 12 months.',                                                 content_type: 'text', label: 'How to Store', sort_order: 4 },
  { section: 'product:cocoa-powder', key: 'tip',          value: "Bloom the powder in hot water or butter before adding it to a batter — it deepens the chocolate flavour significantly.",                       content_type: 'text', label: 'Tip', sort_order: 5 },

  { section: 'product:wild-red-peppercorn', key: 'page_image',   value: '/images/product-peppercorn-tile.jpg',      content_type: 'image', label: 'Image',         sort_order: 1 },
  { section: 'product:wild-red-peppercorn', key: 'what_it_is',   value: 'Wild-harvested peppercorn from Madagascar, picked at the red stage — brighter and more floral than standard black pepper, with a delicate citrus warmth.', content_type: 'text', label: 'What It Is', sort_order: 2 },
  { section: 'product:wild-red-peppercorn', key: 'how_to_use',   value: 'Crack fresh over steak, roasted vegetables, finishing butters, or soft cheese. Best added at the end of cooking to preserve its aroma.', content_type: 'text', label: 'How to Use', sort_order: 3 },
  { section: 'product:wild-red-peppercorn', key: 'how_to_store', value: 'Keep whole in an airtight container away from direct light. Crack as needed — pre-ground loses its floral character quickly.',          content_type: 'text', label: 'How to Store', sort_order: 4 },
  { section: 'product:wild-red-peppercorn', key: 'tip',          value: 'Try it over a plate of ripe mango or strawberries — the citrus notes in the pepper amplify fruit in a way black pepper never does.', content_type: 'text', label: 'Tip', sort_order: 5 },

  { section: 'product:chili-oil', key: 'page_image',   value: '/images/product-chilioil-bottle.jpg',      content_type: 'image', label: 'Image',         sort_order: 1 },
  { section: 'product:chili-oil', key: 'what_it_is',   value: 'Hot oil poured over a blend of dried chilies, toasted sesame, crunchy aromatics, and Madagascar pink peppercorn — built for balance rather than pure heat, with a base of avocado oil for a clean, non-greasy finish.', content_type: 'text', label: 'What It Is', sort_order: 2 },
  { section: 'product:chili-oil', key: 'how_to_use',   value: 'Spoon it over just about anything that could use warmth and texture: fried eggs, noodles, roasted vegetables, soups, or dumplings. Give the jar a stir first — the solids settle.', content_type: 'text', label: 'How to Use', sort_order: 3 },
  { section: 'product:chili-oil', key: 'how_to_store', value: 'Store at room temperature, away from direct sunlight. No refrigeration needed. Use within 6 months of opening.',                                   content_type: 'text', label: 'How to Store', sort_order: 4 },
  { section: 'product:chili-oil', key: 'tip',          value: 'The solids at the bottom are the best part — always stir before using. For extra heat, tip the jar and let the chili sediment pour out first.', content_type: 'text', label: 'Tip', sort_order: 5 },

  // Retail partners / stockists
  { section: 'partners', key: 'logo-1', value: '', content_type: 'image', label: 'Partner Logo 1', sort_order: 1 },
  { section: 'partners', key: 'name-1', value: 'La Maison',    content_type: 'text',  label: 'Partner Name 1', sort_order: 2 },
  { section: 'partners', key: 'logo-2', value: '', content_type: 'image', label: 'Partner Logo 2', sort_order: 3 },
  { section: 'partners', key: 'name-2', value: 'Shams',        content_type: 'text',  label: 'Partner Name 2', sort_order: 4 },
  { section: 'partners', key: 'logo-3', value: '', content_type: 'image', label: 'Partner Logo 3', sort_order: 5 },
  { section: 'partners', key: 'name-3', value: 'Baked',        content_type: 'text',  label: 'Partner Name 3', sort_order: 6 },
  { section: 'partners', key: 'logo-4', value: '', content_type: 'image', label: 'Partner Logo 4', sort_order: 7 },
  { section: 'partners', key: 'name-4', value: 'Fresh Basket', content_type: 'text',  label: 'Partner Name 4', sort_order: 8 },
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

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      content_type TEXT NOT NULL DEFAULT 'text',
      label TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(section, key)
    )
  `;

  console.log('Seeding site content (skipping any that already exist)...');
  for (const c of SEED_CONTENT) {
    await sql`
      INSERT INTO site_content (section, key, value, content_type, label, sort_order)
      VALUES (${c.section}, ${c.key}, ${c.value}, ${c.content_type}, ${c.label}, ${c.sort_order})
      ON CONFLICT (section, key) DO NOTHING
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

  // Fix legacy relative image paths (stored without leading slash) so they work
  // correctly on all pages regardless of URL depth.
  console.log('Patching relative image paths...');
  await sql`
    UPDATE site_content
    SET value = '/' || value
    WHERE content_type = 'image'
      AND value LIKE 'images/%'
  `;

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
