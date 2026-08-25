-- Adds an optional user-provided name for each saved error report.
-- Safe to run multiple times; does not affect existing rows or other columns.
alter table public.error_reports
  add column if not exists code_name text not null default 'Untitled Code';
