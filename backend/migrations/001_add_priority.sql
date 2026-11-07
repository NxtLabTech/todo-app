ALTER TABLE todos
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) NOT NULL DEFAULT 'medium';

UPDATE todos
SET priority = 'medium'
WHERE priority IS NULL;

ALTER TABLE todos
ADD CONSTRAINT todos_priority_check
CHECK (priority IN ('high', 'medium', 'low'));
