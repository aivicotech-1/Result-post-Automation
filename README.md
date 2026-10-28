# Skill2Success Result Post Generator

This project implements a browser-based result poster generator for Skill2Success. It supports bulk generation, validation, preview, export to PNG/PDF, and optional WhatsApp sharing links.

## Features
- CSV/XLSX upload
- Manual student entry
- Validation and row-level issues
- Live canvas preview
- Bulk generation with progress tracking
- ZIP and PDF export
- Share link generation and student result page
- Supabase-ready schema

## Local run

From the project root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Supabase setup

1. Create a project in Supabase.
2. Run the SQL in `supabase/schema.sql`.
3. Update environment variables in `.env.example` if you host a serverless API.

## Notes
This project is intentionally implemented in plain HTML, CSS, and JavaScript to match the project spec and avoid a heavy build step.
