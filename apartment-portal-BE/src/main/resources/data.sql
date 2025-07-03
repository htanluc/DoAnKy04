INSERT INTO roles (id, name) VALUES (1, 'ADMIN')
    ON CONFLICT (id) DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'RESIDENT')
    ON CONFLICT (id) DO NOTHING;
INSERT INTO roles (id, name) VALUES (3, 'STAFF')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, username, email, password_hash, phone_number, status, created_at, updated_at)
    VALUES (
      1,
      'admin',
      'admin@apartment.com',
      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
      '0123456789',
      'ACTIVE',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
    VALUES (1, 1)
    ON CONFLICT (user_id, role_id) DO NOTHING;
