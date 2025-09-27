USE apartment_portal;
ALTER TABLE facilities MODIFY COLUMN opening_schedule LONGTEXT NULL;
DESCRIBE facilities;
