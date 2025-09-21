-- Migration script to add attachment_urls field to service_requests table
-- Run this script to update existing database

-- Add attachment_urls column to service_requests table
ALTER TABLE service_requests 
ADD COLUMN attachment_urls TEXT AFTER image_attachment;

-- Update existing records to have empty attachment_urls
UPDATE service_requests 
SET attachment_urls = '[]' 
WHERE attachment_urls IS NULL;

-- Make attachment_urls NOT NULL with default empty array
ALTER TABLE service_requests 
MODIFY COLUMN attachment_urls TEXT NOT NULL DEFAULT '[]';
