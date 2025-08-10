import { Router } from 'express';
import { db } from '../db/client';
import * as validator from 'validator';

const router = Router();

// GET /api/handshake/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const handshakeResult = await db.query(
      `SELECT id, slug, title, description, created_at, expires_at
       FROM handshakes WHERE slug = $1`,
      [slug]
    );

    if (handshakeResult.rowCount === 0) {
      return res.status(404).json({ error: 'Handshake not found' });
    }

    const handshake = handshakeResult.rows[0];

    const requestResult = await db.query(
      `SELECT id, label, type, required, options
         FROM requests
        WHERE handshake_id = $1
        ORDER BY id`,
      [handshake.id]
    );

    res.json({
      handshake: {
        ...handshake,
        requests: requestResult.rows,
      },
    });
  } catch (err) {
    console.error('Error loading handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/handshake/:slug/submit
router.post('/:slug/submit', async (req, res) => {
  const { slug } = req.params;
  const { responses } = req.body;

  if (!Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid responses' });
  }

  try {
    const handshakeResult = await db.query(
      `SELECT id FROM handshakes WHERE slug = $1`,
      [slug]
    );
    if (handshakeResult.rowCount === 0) {
      return res.status(404).json({ error: 'Handshake not found' });
    }

    const handshakeId = handshakeResult.rows[0].id;

    const requestsResult = await db.query(
      `SELECT id, label, type, required, options
         FROM requests
        WHERE handshake_id = $1`,
      [handshakeId]
    );

    const requests = requestsResult.rows;
    const requestsMap = new Map(requests.map((r: any) => [r.id, r]));

    for (const r of responses) {
      if (
        typeof r.request_id !== 'number' ||
        typeof r.value !== 'string' ||
        !requestsMap.has(r.request_id)
      ) {
        return res.status(400).json({ error: 'Invalid response format or unknown request_id' });
      }

      const reqDef = requestsMap.get(r.request_id);

      switch (reqDef.type) {
        case 'text': {
          if (reqDef.required && r.value.trim() === '') {
            return res.status(400).json({ error: `Response to '${reqDef.label}' is required.` });
          }
          break;
        }

        case 'email': {
          if (reqDef.required && !validator.isEmail(r.value)) {
            return res.status(400).json({ error: `Response to '${reqDef.label}' must be a valid email.` });
          }
          break;
        }

        case 'select': {
          // Defensive rule (B):
          // - If required: value must be non-empty AND in options.
          // - If optional: empty is OK; if provided, it must be in options.
          const opts: string[] = Array.isArray(reqDef.options) ? reqDef.options : [];
          const val = typeof r.value === 'string' ? r.value.trim() : '';

          if (reqDef.required) {
            if (!opts.length || !opts.includes(val)) {
              return res.status(400).json({ error: `Response to '${reqDef.label}' must be one of the allowed options.` });
            }
          } else {
            if (val !== '' && (!opts.length || !opts.includes(val))) {
              return res.status(400).json({ error: `Response to '${reqDef.label}' must be one of the allowed options.` });
            }
          }
          break;
        }

        case 'file': {
          if (reqDef.required && r.value.trim() === '') {
            return res.status(400).json({ error: `File upload for '${reqDef.label}' is required.` });
          }
          break;
        }

        default:
          return res.status(400).json({ error: `Unknown request type for '${reqDef.label}'.` });
      }
    }

    // Ensure all required fields were answered
    const answeredRequestIds = new Set(responses.map((r: any) => r.request_id));
    for (const reqDef of requests) {
      if (reqDef.required && !answeredRequestIds.has(reqDef.id)) {
        return res.status(400).json({ error: `Missing required response for '${reqDef.label}'.` });
      }
    }

    // Create submission
    const submissionResult = await db.query(
      `INSERT INTO submissions (handshake_id) VALUES ($1) RETURNING id`,
      [handshakeId]
    );
    const submissionId = submissionResult.rows[0].id;

    // Bulk insert responses
    const insertValues: string[] = [];
    const params: any[] = [];

    responses.forEach((r: any, i: number) => {
      const offset = i * 3;
      insertValues.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
      params.push(submissionId, r.request_id, r.value);
    });

    await db.query(
      `INSERT INTO responses (submission_id, request_id, value)
       VALUES ${insertValues.join(', ')}`,
      params
    );

    res.status(201).json({ submission_id: submissionId });
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
