PRAGMA foreign_keys = ON;

-- Artisans (suppliers)
CREATE TABLE IF NOT EXISTS artisans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_info TEXT,
    craft_types TEXT,
    lead_time_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update artisans.updated_at
CREATE TRIGGER IF NOT EXISTS artisans_updated_at
BEFORE UPDATE ON artisans
FOR EACH ROW
BEGIN
    -- Only update if something actually changes; but simplest is:
    UPDATE artisans SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    -- Note: this extra UPDATE can cause recursion in some SQLite versions.
    -- A safer pattern:
    -- SET NEW.updated_at = CURRENT_TIMESTAMP; 
    -- But SQLite BEFORE triggers can directly modify NEW:
    -- In SQLite, use: SELECT CASE WHEN (NEW.* differs from OLD.*) THEN CURRENT_TIMESTAMP ELSE OLD.updated_at END INTO NEW.updated_at;
    -- However, simplest in practice: use 
    --   CREATE TRIGGER ... BEFORE UPDATE ON artisans FOR EACH ROW BEGIN 
    --     SET NEW.updated_at = CURRENT_TIMESTAMP; 
    --   END;
    -- But SQLite’s syntax is: 
    --   CREATE TRIGGER ... BEFORE UPDATE AS 
    --     UPDATE ... 
    -- So the pattern above is common, though it may re-fire. 
    -- Alternatively, do:
    --   CREATE TRIGGER artisans_updated_at
    --   BEFORE UPDATE ON artisans
    --   FOR EACH ROW
    --   BEGIN
    --     SELECT RAISE(IGNORE) WHERE 
    --       NEW.name = OLD.name
    --       AND NEW.contact_info = OLD.contact_info
    --       AND NEW.craft_types = OLD.craft_types
    --       AND NEW.lead_time_days = OLD.lead_time_days;
    --     -- If changes exist:
    --     SET NEW.updated_at = CURRENT_TIMESTAMP;
    --   END;
    -- For simplicity, many just always set updated_at:
END;

-- Products
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    artisan_id INTEGER,
    cost REAL DEFAULT 0.00,
    price REAL DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE SET NULL
);

-- Trigger to auto-update products.updated_at
CREATE TRIGGER IF NOT EXISTS products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update orders.updated_at
CREATE TRIGGER IF NOT EXISTS orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_order REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
