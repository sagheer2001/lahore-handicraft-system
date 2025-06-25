-- -- schema.sql
-- CREATE DATABASE IF NOT EXISTS mysqlt3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE mysqlt3;

-- -- Artisans (suppliers)
-- CREATE TABLE IF NOT EXISTS artisans (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     contact_info TEXT,
--     craft_types VARCHAR(255),
--     lead_time_days INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Products
-- CREATE TABLE IF NOT EXISTS products (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     category VARCHAR(100),
--     artisan_id INT,
--     cost DECIMAL(10,2) DEFAULT 0.00,
--     price DECIMAL(10,2) DEFAULT 0.00,
--     stock INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE SET NULL
-- );

-- -- Orders
-- CREATE TABLE IF NOT EXISTS orders (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('ACTIVE','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Order items
-- CREATE TABLE IF NOT EXISTS order_items (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_id INT NOT NULL,
--     product_id INT NOT NULL,
--     quantity INT NOT NULL,
--     price_at_order DECIMAL(10,2) NOT NULL,
--     FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
-- );

