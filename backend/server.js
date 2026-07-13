const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = 'RecGoblinguONLY';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../images')));

// Database connection
const db = new sqlite3.Database(path.join(__dirname, '../database/archive.db'));

// File upload configuration for submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images/submissions'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File upload configuration for approved images
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const submissionUpload = multer({ storage: submissionStorage });
const upload = multer({ storage: uploadStorage });

// ============ ADMIN AUTHENTICATION ============

// Verify admin password
const verifyAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
  next();
};

// ============ ITEMS ENDPOINTS ============

// Get all items
app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get item by ID
app.get('/api/items/:id', (req, res) => {
  db.get('SELECT * FROM items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    res.json(row);
  });
});

// Create item (admin only)
app.post('/api/items', verifyAdmin, (req, res) => {
  const { name, description, category, rarity, release_date } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO items (id, name, description, category, rarity, release_date) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, description, category, rarity, release_date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, description, category, rarity, release_date });
    }
  );
});

// Update item (admin only)
app.put('/api/items/:id', verifyAdmin, (req, res) => {
  const { name, description, category, rarity, release_date, status } = req.body;
  
  db.run(
    'UPDATE items SET name = ?, description = ?, category = ?, rarity = ?, release_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, category, rarity, release_date, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
      res.json({ message: 'Item updated' });
    }
  );
});

// ============ MAPS ENDPOINTS ============

// Get all maps
app.get('/api/maps', (req, res) => {
  db.all('SELECT * FROM maps', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get map by ID
app.get('/api/maps/:id', (req, res) => {
  db.get('SELECT * FROM maps WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Map not found' });
    res.json(row);
  });
});

// Create map (admin only)
app.post('/api/maps', verifyAdmin, (req, res) => {
  const { name, description, environment_type, release_date, version, max_players } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO maps (id, name, description, environment_type, release_date, version, max_players) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, description, environment_type, release_date, version, max_players],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, description, environment_type, release_date, version, max_players });
    }
  );
});

// ============ ROOMS ENDPOINTS ============

// Get all rooms
app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get room by ID
app.get('/api/rooms/:id', (req, res) => {
  db.get('SELECT * FROM rooms WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Room not found' });
    res.json(row);
  });
});

// Create room (admin only)
app.post('/api/rooms', verifyAdmin, (req, res) => {
  const { name, creator, description, room_type, created_date } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO rooms (id, name, creator, description, room_type, created_date) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, creator, description, room_type, created_date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, creator, description, room_type, created_date });
    }
  );
});

// ============ GAME HISTORY ENDPOINTS ============

// Get all history events
app.get('/api/history', (req, res) => {
  db.all('SELECT * FROM game_history ORDER BY event_date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create history event (admin only)
app.post('/api/history', verifyAdmin, (req, res) => {
  const { title, description, event_date, event_type, significance } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO game_history (id, title, description, event_date, event_type, significance) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, description, event_date, event_type, significance],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, title, description, event_date, event_type, significance });
    }
  );
});

// ============ MEDIA/IMAGE ENDPOINTS ============

// Upload image (admin only)
app.post('/api/media/upload', verifyAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const id = uuidv4();
  const { tags, source_id, source_type } = req.body;
  
  db.run(
    'INSERT INTO media (id, filename, original_name, file_path, file_size, mime_type, tags, source_id, source_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.file.filename, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, tags, source_id, source_type],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, url: `/images/uploads/${req.file.filename}`, filename: req.file.filename });
    }
  );
});

// Get all media
app.get('/api/media', (req, res) => {
  db.all('SELECT * FROM media', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Link media to item (admin only)
app.post('/api/items/:itemId/media/:mediaId', verifyAdmin, (req, res) => {
  db.run(
    'INSERT INTO item_media (item_id, media_id) VALUES (?, ?)',
    [req.params.itemId, req.params.mediaId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Media linked to item' });
    }
  );
});

// ============ PHOTO SUBMISSION ENDPOINTS ============

// Submit a photo (public endpoint)
app.post('/api/submissions/upload', submissionUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const id = uuidv4();
  const { submitted_by, tags, associated_item, associated_map, associated_room, description } = req.body;
  
  db.run(
    'INSERT INTO photo_submissions (id, filename, original_name, file_path, file_size, mime_type, submitted_by, tags, associated_item, associated_map, associated_room, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.file.filename, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, submitted_by, tags, associated_item, associated_map, associated_room, description],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id, 
        message: 'Photo submitted successfully and pending admin approval',
        url: `/images/submissions/${req.file.filename}`
      });
    }
  );
});

// Get all pending submissions (admin only)
app.get('/api/submissions/pending', verifyAdmin, (req, res) => {
  db.all("SELECT * FROM photo_submissions WHERE status = 'pending' ORDER BY submitted_date DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all submissions (admin only)
app.get('/api/submissions', verifyAdmin, (req, res) => {
  db.all('SELECT * FROM photo_submissions ORDER BY submitted_date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get submission by ID (admin only)
app.get('/api/submissions/:id', verifyAdmin, (req, res) => {
  db.get('SELECT * FROM photo_submissions WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Submission not found' });
    res.json(row);
  });
});

// Approve submission (admin only)
app.post('/api/submissions/:id/approve', verifyAdmin, (req, res) => {
  const submissionId = req.params.id;
  
  db.get('SELECT * FROM photo_submissions WHERE id = ?', [submissionId], (err, submission) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    
    const mediaId = uuidv4();
    const adminUser = req.body.approved_by || 'admin';
    
    // Move to approved media
    db.run(
      'INSERT INTO media (id, filename, original_name, file_path, file_size, mime_type, tags, source_id, source_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [mediaId, submission.filename, submission.original_name, submission.file_path, submission.file_size, submission.mime_type, submission.tags, submission.id, 'submission'],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Link to associated item/map/room if provided
        if (submission.associated_item) {
          db.run('INSERT INTO item_media (item_id, media_id) VALUES (?, ?)', [submission.associated_item, mediaId]);
        }
        if (submission.associated_map) {
          db.run('INSERT INTO map_media (map_id, media_id) VALUES (?, ?)', [submission.associated_map, mediaId]);
        }
        if (submission.associated_room) {
          db.run('INSERT INTO room_media (room_id, media_id) VALUES (?, ?)', [submission.associated_room, mediaId]);
        }
        
        // Update submission status
        db.run(
          'UPDATE photo_submissions SET status = ?, approved_by = ?, approved_date = CURRENT_TIMESTAMP WHERE id = ?',
          ['approved', adminUser, submissionId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Submission approved and added to archive', media_id: mediaId });
          }
        );
      }
    );
  });
});

// Reject submission (admin only)
app.post('/api/submissions/:id/reject', verifyAdmin, (req, res) => {
  const { reason } = req.body;
  const adminUser = req.body.approved_by || 'admin';
  
  db.run(
    'UPDATE photo_submissions SET status = ?, approved_by = ?, rejected_reason = ?, approved_date = CURRENT_TIMESTAMP WHERE id = ?',
    ['rejected', adminUser, reason, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Submission not found' });
      res.json({ message: 'Submission rejected' });
    }
  );
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'API running' });
});

app.listen(PORT, () => {
  console.log(`Archive.Rec API running on http://localhost:${PORT}`);
});
