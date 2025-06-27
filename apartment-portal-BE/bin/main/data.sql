MERGE INTO roles (name) KEY(name) VALUES ('ADMIN');
MERGE INTO roles (name) KEY(name) VALUES ('RESIDENT');
MERGE INTO roles (name) KEY(name) VALUES ('STAFF');

MERGE INTO users (username, email, password_hash, phone_number, status, created_at, updated_at)
    KEY(username) VALUES (
      'admin',
      'admin@apartment.com',
      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
      'admin',
      'ACTIVE',
      NOW(),
      NOW()
    );

MERGE INTO user_roles (user_id, role_id) KEY(user_id, role_id)
    SELECT u.id, r.id
      FROM users u, roles r
     WHERE u.username = 'admin'
       AND r.name = 'ADMIN';
